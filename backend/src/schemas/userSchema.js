const { z } = require('zod');

// Regex patterns
const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const nameRegex = /^[A-Za-z'-]+$/;
const phoneRegex = /^\d+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;  // YYYY-MM-DD
const idRegex = /^[A-Za-z0-9]+$/;
const numericRegex = /^\d+(?:\.\d+)?$/;  // integer or decimal
const allergyRegex = /^[A-Za-z ,]+$/;
const specializationRegex = /^[A-Za-z &]+$/;
const licenseRegex = /^[A-Za-z0-9-]+$/;

const patientProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .regex(nameRegex, { message: 'First name may only contain letters, apostrophes, and hyphens' }),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .regex(nameRegex, { message: 'Last name may only contain letters, apostrophes, and hyphens' }),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(phoneRegex, { message: 'Phone may only contain numbers' }),
  address: z.string().min(1, 'Address is required'),
  birth_date: z
    .string()
    .min(1, 'Birth date is required')
    .regex(dateRegex, { message: 'Birth date must be in YYYY-MM-DD format' }),
  government_id: z
    .string()
    .min(1, 'Government ID is required')
    .regex(idRegex, { message: 'Government ID may only contain letters and numbers' }),
  blood_type: z.enum(validBloodTypes, {
    errorMap: () => ({ message: `Blood type must be one of: ${validBloodTypes.join(', ')}` }),
  }),
  height: z
    .string()
    .min(1, 'Height is required')
    .regex(numericRegex, { message: 'Height must be a number (e.g., 170 or 170.5)' }),
  weight: z
    .string()
    .min(1, 'Weight is required')
    .regex(numericRegex, { message: 'Weight must be a number (e.g., 65 or 65.2)' }),
  allergies: z
    .string()
    .min(1, 'Allergies are required')
    .regex(allergyRegex, { message: 'Allergies may only contain letters, commas, and spaces' }),
});

const doctorProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .regex(nameRegex, { message: 'First name may only contain letters, apostrophes, and hyphens' }),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .regex(nameRegex, { message: 'Last name may only contain letters, apostrophes, and hyphens' }),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(phoneRegex, { message: 'Phone may only contain numbers' }),
  address: z.string().min(1, 'Address is required'),
  specialization: z
    .string()
    .min(1, 'Specialization is required')
    .regex(specializationRegex, { message: 'Specialization may only contain letters, spaces, and ampersands' }),
  license_number: z
    .string()
    .min(1, 'License number is required')
    .regex(licenseRegex, { message: 'License number may only contain letters, numbers, and hyphens' }),
});

const adminProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .regex(nameRegex, { message: 'First name may only contain letters, apostrophes, and hyphens' }),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .regex(nameRegex, { message: 'Last name may only contain letters, apostrophes, and hyphens' }),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(phoneRegex, { message: 'Phone may only contain numbers' }),
});

module.exports = { patientProfileSchema, doctorProfileSchema, adminProfileSchema };
