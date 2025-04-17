const { z } = require("zod");

const validBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const patientProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  birth_date: z.string().min(1, "Birth date is required"),
  government_id: z.string().min(1, "Government ID is required"),
  blood_type: z.enum(validBloodTypes, {
    errorMap: () => ({ message: `Blood type must be one of: ${validBloodTypes.join(", ")}` })
  }),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  allergies: z.string().min(1, "Allergies are required"),
});

const doctorProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  specialization: z.string().min(1, "Specialization is required"),
  license_number: z.string().min(1, "License number is required"),
});

const adminProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
});

module.exports = { patientProfileSchema, doctorProfileSchema, adminProfileSchema };
