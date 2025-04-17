const db = require("../src/db");
jest.mock("../src/db");

const {
  logActivity,
  getRecentActivities
} = require("../src/controllers/activityLogController");
const { InternalServerError } = require("../src/utils/errors");

describe("activityLogController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logActivity", () => {
    it("should insert a new activity log with the correct SQL and parameters", async () => {
      db.query.mockResolvedValue({});
      await logActivity(42, "patient", "Test action");

      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO activity_logs (user_id, role, description) VALUES ($1, $2, $3)",
        [42, "patient", "Test action"]
      );
    });
  });

  describe("getRecentActivities", () => {
    let req, res;

    beforeEach(() => {
      req = { user: { userId: 7, role: "doctor" } };
      res = { json: jest.fn() };
    });

    it("should fetch the 10 most recent activities and return them", async () => {
      const mockRows = [
        { description: "foo", created_at: new Date("2022-01-01") },
        { description: "bar", created_at: new Date("2022-01-02") },
      ];
      db.query.mockResolvedValue({ rows: mockRows });

      await getRecentActivities(req, res);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT description, created_at"),
        [7, "doctor"]
      );
      expect(res.json).toHaveBeenCalledWith(mockRows);
    });

    it("should throw InternalServerError if the database query fails", async () => {
      db.query.mockRejectedValue(new Error("DB is down"));

      await expect(getRecentActivities(req, res))
        .rejects
        .toBeInstanceOf(InternalServerError);
    });
  });
});
