const { BadRequestError, NotFoundError, InternalServerError } = require("../../../backend/src/utils/errors");
const db = require("../db");

const addPrescription = async (req, res) => {
  const {
    patientName,
    patientDob,
    patientId,
    drugName,
    dosage,
    instructions,
    endDate
  } = req.body;

  if (!patientName || !patientDob || !patientId || !drugName || !dosage) {
    throw new BadRequestError("All fields are required.");
  }

  const doctor_user_id = req.user.userId;

  try {
    const doctorResult = await db.query("SELECT id FROM doctors WHERE user_id = $1", [doctor_user_id]);
    const doctor_id = doctorResult.rows[0]?.id;

    if (!doctor_id) {
      throw new BadRequestError("Doctor not found" );
    }

    const drugResult = await db.query("SELECT id FROM drugs WHERE name ILIKE $1", [drugName]);
    const drug_id = drugResult.rows[0]?.id;
    if (!drug_id) {
      throw new NotFoundError("Drug not found");
    }

    const patientResult = await db.query(
      `SELECT id FROM patients
       WHERE government_id = $1
         AND CONCAT(first_name, ' ', last_name) = $2
         AND birth_date = $3`,
      [patientId, patientName, patientDob]
    );
    const patient = patientResult.rows[0];
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    await db.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, drug_id, dosage, instructions, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [patient.id, doctor_id, drug_id, dosage, instructions, endDate || null]
    );

    res.status(201).json({ message: "Prescription added successfully" });
  } catch (err) {
    throw new InternalServerError();
  }
};

const endPrescription = async (req, res) => {
  const prescriptionId = req.params.id;

  try {
    await db.query(
      `UPDATE prescriptions SET end_date = CURRENT_DATE WHERE id = $1`,
      [prescriptionId]
    );
    res.json({ message: "Prescription marked as ended" });
  } catch (err) {
    throw new InternalServerError();
  }
};

const getPrescriptionsByDoctor = async (req, res) => {
  const doctorUserId = req.user.userId;

  try {
    const doctorResult = await db.query("SELECT id FROM doctors WHERE user_id = $1", [doctorUserId]);
    const doctor_id = doctorResult.rows[0]?.id;

    if (!doctor_id) {
      throw new NotFoundError("Doctor not found");
    }

    const result = await db.query(`
      SELECT p.id, d.name AS drug_name,
             pat.first_name || ' ' || pat.last_name AS patient_name,
             p.dosage, p.instructions, p.prescribed_at, p.end_date
      FROM prescriptions p
      JOIN drugs d ON p.drug_id = d.id
      JOIN patients pat ON p.patient_id = pat.id
      WHERE p.doctor_id = $1
      ORDER BY p.prescribed_at DESC
    `, [doctor_id]);

    res.json(result.rows);
  } catch (err) {
   throw new InternalServerError();
  }
};

module.exports = {
  addPrescription,
  endPrescription,
  getPrescriptionsByDoctor
};
