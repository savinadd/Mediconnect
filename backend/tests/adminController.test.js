const db = require("../src/db");
jest.mock("../src/db");

const {
  getAdminSummary,
  getAllUsers,
  getDoctors,
  getPatients,
  getAdmins,
  deleteUser
} = require("../src/controllers/adminController");
const {
  InternalServerError
} = require("../src/utils/errors");

describe("adminController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAdminSummary", () => {
    it("should return correct totals when all queries succeed", async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ count: "10" }] }) // users
        .mockResolvedValueOnce({ rows: [{ count: "3"  }] }) // doctors
        .mockResolvedValueOnce({ rows: [{ count: "5"  }] }) // patients
        .mockResolvedValueOnce({ rows: [{ count: "2"  }] }); // admins

      const res = { json: jest.fn() };
      await getAdminSummary({}, res);

      expect(db.query).toHaveBeenCalledTimes(4);
      expect(res.json).toHaveBeenCalledWith({
        totalUsers:   10,
        totalDoctors: 3,
        totalPatients:5,
        totalAdmins:  2,
      });
    });

    it("should throw InternalServerError if any query fails", async () => {
      db.query.mockRejectedValue(new Error("boom"));
      await expect(getAdminSummary({}, { json: jest.fn() }))
        .rejects
        .toBeInstanceOf(InternalServerError);
    });
  });

  const makeSimpleFetchTest = (fnName, sqlSnippet) => {
    describe(fnName, () => {
      it("should return rows on success", async () => {
        const fakeRows = [{ foo: "bar" }, { foo: "baz" }];
        db.query.mockResolvedValue({ rows: fakeRows });
        const res = { json: jest.fn() };
        await (exports[fnName] || eval(fnName))({}, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining(sqlSnippet));
        expect(res.json).toHaveBeenCalledWith(fakeRows);
      });

      it("should throw InternalServerError on failure", async () => {
        db.query.mockRejectedValue(new Error("nope"));
        await expect(
          (exports[fnName] || eval(fnName))({}, { json: jest.fn() })
        ).rejects.toBeInstanceOf(InternalServerError);
      });
    });
  };

  describe("getAllUsers", () => {
    it("should return rows on success", async () => {
      const fake = [{id:1}, {id:2}];
      db.query.mockResolvedValue({ rows: fake });
      const res = { json: jest.fn() };
      await getAllUsers({}, res);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM users")
      );
      expect(res.json).toHaveBeenCalledWith(fake);
    });
    it("throws on failure", async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getAllUsers({}, { json: jest.fn() }))
        .rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe("getDoctors", () => {
    it("should return rows on success", async () => {
      const fake = [{id:1}];
      db.query.mockResolvedValue({ rows: fake });
      const res = { json: jest.fn() };
      await getDoctors({}, res);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM doctors")
      );
      expect(res.json).toHaveBeenCalledWith(fake);
    });
    it("throws on failure", async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getDoctors({}, { json: jest.fn() }))
        .rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe("getPatients", () => {
    it("should return rows on success", async () => {
      const fake = [{id:1}];
      db.query.mockResolvedValue({ rows: fake });
      const res = { json: jest.fn() };
      await getPatients({}, res);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM patients")
      );
      expect(res.json).toHaveBeenCalledWith(fake);
    });
    it("throws on failure", async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getPatients({}, { json: jest.fn() }))
        .rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe("getAdmins", () => {
    it("should return rows on success", async () => {
      const fake = [{id:1}];
      db.query.mockResolvedValue({ rows: fake });
      const res = { json: jest.fn() };
      await getAdmins({}, res);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM admins")
      );
      expect(res.json).toHaveBeenCalledWith(fake);
    });
    it("throws on failure", async () => {
      db.query.mockRejectedValue(new Error());
      await expect(getAdmins({}, { json: jest.fn() }))
        .rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe("deleteUser", () => {
    it("should delete a patient if found", async () => {
      const req = { params: { userId: "123" } };
      const res = { json: jest.fn() };

      // 1st call: find patient
      // 2nd call: find doctor
      // 3rd call: find admin
      // 4th call: delete patient
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 123 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({});

      await deleteUser(req, res);

      expect(db.query).toHaveBeenNthCalledWith(
        1,
        "SELECT * FROM patients WHERE id = $1",
        [ "123" ]
      );
      expect(db.query).toHaveBeenNthCalledWith(
        4,
        "DELETE FROM patients WHERE id = $1",
        [ "123" ]
      );
      expect(res.json).toHaveBeenCalledWith({ message: "User deleted successfully" });
    });

    it("should throw InternalServerError if nothing to delete (or on DB error)", async () => {
      const req = { params: { userId: "999" } };

      db.query.mockResolvedValue({ rows: [] });

      await expect(deleteUser(req, { json: jest.fn() }))
        .rejects
        .toBeInstanceOf(InternalServerError);
    });
  });
});
