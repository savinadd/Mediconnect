// // tests/profileEditController.test.js

// const db = require("../src/db");
// const { ZodError } = require("zod");
// const { editUserProfile } = require("../src/controllers/profileEditController");
// const {
//   BadRequestError,
//   InternalServerError,
// } = require("../src/utils/errors");

// jest.mock("../src/db");
// jest.mock("../src/controllers/activityLogController", () => ({
//   logActivity: jest.fn(),
// }));

// describe("Profile Edit Controller", () => {
//   let req, res;

//   beforeEach(() => {
//     req = { user: {}, body: {} };
//     res = { json: jest.fn() };
//     jest.clearAllMocks();
//   });

//   it("throws BadRequestError if unknown role", async () => {
//     req.user = { role: "ghost", userId: 1 };
//     await expect(editUserProfile(req, res)).rejects.toBeInstanceOf(BadRequestError);
//   });

//   it("updates patient profile and returns success", async () => {
//     req.user = { role: "patient", userId: 1 };
//     req.body = {
//       first_name: "F", last_name: "L", phone: "p", address: "a",
//       birth_date: "2020-01-01", government_id: "G", blood_type: "A+",
//       height: "170", weight: "70", allergies: "none"
//     };
//     db.query.mockResolvedValue({});
//     await editUserProfile(req, res);
//     expect(db.query).toHaveBeenCalledWith(
//       expect.stringContaining("UPDATE patients"),
//       expect.arrayContaining(["F", "L"])
//     );
//     expect(res.json).toHaveBeenCalledWith({ message: "Profile updated successfully" });
//   });

//   it("updates doctor profile", async () => {
//     req.user = { role: "doctor", userId: 2 };
//     req.body = {
//       first_name: "Doc", last_name: "Tor", phone: "p", address: "a",
//       specialization: "S", license_number: "L"
//     };
//     db.query
//       .mockResolvedValueOnce({ rows: [] })  // select admins existing
//       .mockResolvedValueOnce({})             // update doctors
//     ;
//     await editUserProfile(req, res);
//     expect(db.query).toHaveBeenCalledWith(
//       expect.stringContaining("UPDATE doctors"),
//       expect.any(Array)
//     );
//   });

//   it("throws InternalServerError on Zod parse error", async () => {
//     req.user = { role: "patient", userId: 1 };
//     // force Zod to throw
//     const z = require("zod");
//     jest.spyOn(z, "string").mockImplementation(() => ({
//       min: () => { throw new ZodError([]); }
//     }));
//     await expect(editUserProfile(req, res)).rejects.toBeInstanceOf(InternalServerError);
//   });

//   it("throws InternalServerError on DB error", async () => {
//     req.user = { role: "patient", userId: 1 };
//     req.body = {
//       first_name: "F", last_name: "L", phone: "p", address: "a",
//       birth_date: "2020-01-01", government_id: "G", blood_type: "A+",
//       height: "170", weight: "70", allergies: "none"
//     };
//     db.query.mockRejectedValue(new Error());
//     await expect(editUserProfile(req, res)).rejects.toBeInstanceOf(InternalServerError);
//   });
// });
