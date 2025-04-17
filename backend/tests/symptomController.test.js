const db = require("../src/db");
const { addPatientSymptom, getPatientSymptomHistory } = require("../src/controllers/symptomController");
const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} = require("../src/utils/errors");
const { validationResult } = require("express-validator");
const { logActivity } = require("../src/controllers/activityLogController");

jest.mock("../src/db");
jest.mock("express-validator");
jest.mock("../src/controllers/activityLogController");

describe("symptomController", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { userId: 1, role: "patient" }, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe("addPatientSymptom", () => {
    it("throws BadRequestError if validation fails", async () => {
      validationResult.mockReturnValue({ isEmpty: () => false, array: () => [{ msg: "err" }] });
      await expect(addPatientSymptom(req, res)).rejects.toBeInstanceOf(
        BadRequestError
      );
    });

    it("throws NotFoundError if patient not found", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(addPatientSymptom(req, res)).rejects.toBeInstanceOf(
        NotFoundError
      );
    });

    it("creates new and logs activity", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.body = { symptomName: "Fever", description: "d", severity: "high", duration: "1d", notes: "n" };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 9 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 7 }] })
        .mockResolvedValueOnce({});

      await addPatientSymptom(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO symptoms"),
        expect.arrayContaining(["Fever", "d"])
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO patient_symptoms"),
        expect.any(Array)
      );
      expect(logActivity).toHaveBeenCalledWith(1, "patient", expect.stringContaining("Logged symptom"));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Symptom logged successfully" });
    });

    it("wraps DB error in InternalServerError", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      db.query.mockRejectedValue(new Error());
      await expect(addPatientSymptom(req, res)).rejects.toBeInstanceOf(
        InternalServerError
      );
    });
  });

  describe("getPatientSymptomHistory", () => {
    it("throws NotFoundError if no patient record", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(getPatientSymptomHistory(req, res)).rejects.toBeInstanceOf(
        NotFoundError
      );
    });

    it("returns history rows on success", async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 5 }] })            // patient
        .mockResolvedValueOnce({ rows: [{ symptom_name: "S" }] }); // history
      await getPatientSymptomHistory(req, res);
      expect(res.json).toHaveBeenCalledWith([{ symptom_name: "S" }]);
    });

    it("wraps errors", async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getPatientSymptomHistory(req, res)).rejects.toBeInstanceOf(
        InternalServerError
      );
    });
  });
});
