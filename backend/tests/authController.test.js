const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../src/db");
const {
  registerUser,
  loginUser,
  logoutUser,
  getRegistrationRole,
} = require("../src/controllers/authController");
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
} = require("../src/utils/errors");

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../src/db");

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, cookies: {}, headers: {} };
    res = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("throws BadRequestError if missing fields", async () => {
      req.body = { email: "", password: "", role: "" };
      await expect(registerUser(req, res)).rejects.toBeInstanceOf(BadRequestError);
    });

    it("throws BadRequestError on invalid email format", async () => {
      req.body = { email: "no-at", password: "pw", role: "patient" };
      await expect(registerUser(req, res)).rejects.toBeInstanceOf(BadRequestError);
    });

    it("throws BadRequestError on invalid role", async () => {
      req.body = { email: "a@b.com", password: "pw123", role: "invalid" };
      await expect(registerUser(req, res)).rejects.toBeInstanceOf(BadRequestError);
    });

    it("throws BadRequestError if email already exists", async () => {
      req.body = { email: "a@b.com", password: "pw123", role: "patient" };
      db.query.mockResolvedValue({ rows: [{ id: 1 }] });
      await expect(registerUser(req, res)).rejects.toBeInstanceOf(BadRequestError);
    });

    it("sets cookie and returns 201 on success", async () => {
      req.body = { email: "a@b.com", password: "pw123", role: "patient" };
      db.query.mockResolvedValue({ rows: [] });
      bcrypt.hash.mockResolvedValue("hashed");
      jwt.sign.mockReturnValue("token123");

      await registerUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("pw123", 10);
      expect(jwt.sign).toHaveBeenCalledWith(
        { email: "a@b.com", role: "patient", password: "hashed" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "token123",
        expect.objectContaining({ httpOnly: true, sameSite: "Strict" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Registration initiated. Please complete your profile.",
      });
    });

    it("wraps DB errors in InternalServerError", async () => {
      req.body = { email: "a@b.com", password: "pw", role: "patient" };
      db.query.mockRejectedValue(new Error("boom"));
      await expect(registerUser(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe("loginUser", () => {
    it("throws BadRequestError if missing fields", async () => {
      req.body = { email: "", password: "" };
      await expect(loginUser(req, res)).rejects.toBeInstanceOf(BadRequestError);
    });

    it("throws BadRequestError on unknown email", async () => {
      req.body = { email: "x@y.com", password: "pw" };
      db.query.mockResolvedValue({ rows: [] });
      await expect(loginUser(req, res)).rejects.toBeInstanceOf(BadRequestError);
    });

    it("throws BadRequestError on wrong password", async () => {
      req.body = { email: "x@y.com", password: "pw" };
      db.query.mockResolvedValue({ rows: [{ id: 5, role: "patient", password_hash: "h" }] });
      bcrypt.compare.mockResolvedValue(false);
      await expect(loginUser(req, res)).rejects.toBeInstanceOf(BadRequestError);
    });

    it("sets cookie and returns user on success", async () => {
      req.body = { email: "x@y.com", password: "pw" };
      const userRow = { id: 5, role: "doctor", password_hash: "h" };
      db.query.mockResolvedValue({ rows: [userRow] });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("jwt-token");

      await loginUser(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 5, role: "doctor" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "jwt-token",
        expect.objectContaining({ httpOnly: true, sameSite: "Strict" })
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        user: { id: 5, role: "doctor" },
      });
    });

    it("wraps unexpected errors in InternalServerError", async () => {
      req.body = { email: "x@y.com", password: "pw" };
      db.query.mockRejectedValue(new Error("boom"));
      await expect(loginUser(req, res)).rejects.toBeInstanceOf(InternalServerError);
    });
  });

  describe("logoutUser", () => {
    it("clears cookie and returns message", () => {
      logoutUser(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith(
        "token",
        expect.objectContaining({ httpOnly: true, sameSite: "Strict" })
      );
      expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
    });
  });

  describe("getRegistrationRole", () => {
    it("throws UnauthorizedError if no token", () => {
      req.cookies = {};
      expect(() => getRegistrationRole(req, res)).toThrow(UnauthorizedError);
    });

    it("returns role if token valid", () => {
      req.cookies = { token: "abc" };
      jwt.verify.mockReturnValue({ role: "patient" });
      getRegistrationRole(req, res);
      expect(res.json).toHaveBeenCalledWith({ role: "patient" });
    });

    it("throws ForbiddenError if token invalid", () => {
      req.cookies = { token: "abc" };
      jwt.verify.mockImplementation(() => { throw new Error("bad"); });
      expect(() => getRegistrationRole(req, res)).toThrow(ForbiddenError);
    });
  });
});
