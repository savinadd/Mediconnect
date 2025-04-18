const db = require("../src/db");
const {
  addPatientSymptom,
  getPatientSymptomHistory,
} = require("../src/controllers/symptomController");
const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} = require("../src/utils/errors");
const { logActivity } = require("../src/controllers/activityLogController");

jest.mock("../src/db");
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

      await expect(addPatientSymptom(req, res)).rejects.toBeInstanceOf(
        BadRequestError
      );
    });

    it("throws NotFoundError if patient not found", async () => {
      req.body = { description: "Headache" };
      db.query.mockResolvedValueOnce({ rows: [] }); // patient lookup
      await expect(addPatientSymptom(req, res)).rejects.toBeInstanceOf(
        NotFoundError
      );
    });

    it("creates new symptom and logs activity", async () => {
      req.body = {
        symptomName: "Fever",
        description: "High fever",
        severity: "high",
        duration: "1d",
        notes: "Took paracetamol",
      };

      db.query
        .mockResolvedValueOnce({ rows: [{ id: 9 }] })   // patient lookup
        .mockResolvedValueOnce({ rows: [] })            // existingSymptom lookup
        .mockResolvedValueOnce({ rows: [{ id: 7 }] })   // insert into symptoms
        .mockResolvedValueOnce({});                     // insert into patient_symptoms

      await addPatientSymptom(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO symptoms"),
        ["Fever", "High fever"]
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO patient_symptoms"),
        expect.any(Array)
      );

      expect(logActivity).toHaveBeenCalledWith(
        1,
        "patient",
        expect.stringContaining("Logged symptom")
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Symptom logged successfully",
      });
    });

    it("wraps DB error in InternalServerError", async () => {
      req.body = { description: "Cough" };
      db.query.mockRejectedValue(new Error("boom"));
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
        .mockResolvedValueOnce({ rows: [{ id: 5 }] })       // patient lookup
        .mockResolvedValueOnce({ rows: [{ symptom_name: "S" }] }); // history
      await getPatientSymptomHistory(req, res);
      expect(res.json).toHaveBeenCalledWith([{ symptom_name: "S" }]);
    });

    it("wraps errors in InternalServerError", async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getPatientSymptomHistory(req, res)).rejects.toBeInstanceOf(
        InternalServerError
      );
    });
  });
});
