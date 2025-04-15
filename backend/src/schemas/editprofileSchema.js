const { z } = require("zod");

const baseUserSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  phone: z.string().min(6, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
});

const patientSchema = baseUserSchema.extend({
  birth_date: z.string().min(1, "Birth date is required"),
  government_id: z.string().min(1, "Government ID is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  allergies: z.string().min(1, "Allergies are required")
});

const doctorSchema = baseUserSchema.extend({
  specialization: z.string().optional(),
  license_number: z.string().optional()
});

module.exports = {
  patientSchema,
  doctorSchema
};
