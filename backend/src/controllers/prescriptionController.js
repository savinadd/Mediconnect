const db = require("../db");
const {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  AppError
} = require("../utils/errors");
const { logActivity } = require("./activityLogController");

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

  const userId = req.user.userId;
  const role = req.user.role;

  try {
    const dr = await db.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [userId]
    );
    const doctor_id = dr.rows[0]?.id;
    if (!doctor_id) {
      throw new BadRequestError("Doctor not found");
    }

    const dg = await db.query(
      "SELECT id FROM drugs WHERE name ILIKE $1",
      [drugName]
    );
    const drug_id = dg.rows[0]?.id;
    if (!drug_id) {
      throw new NotFoundError("Drug not found");
    }

    const pt = await db.query(
      `SELECT id
         FROM patients
        WHERE government_id = $1
          AND CONCAT(first_name, ' ', last_name) = $2
          AND birth_date = $3`,
      [patientId, patientName, patientDob]
    );
    const patient = pt.rows[0];
    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    await db.query(
      `INSERT INTO prescriptions
         (patient_id, doctor_id, drug_id, dosage, instructions, end_date)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        patient.id,
        doctor_id,
        drug_id,
        dosage,
        instructions,
        endDate || null
      ]
    );

    await logActivity(
      userId,
      role,
      `Prescribed ${drugName} to ${patientName}`
    );
    res.status(201).json({ message: "Prescription added successfully" });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError("Error adding prescription");
  }
};

const endPrescription = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query(
      `UPDATE prescriptions SET end_date = CURRENT_DATE WHERE id = $1`,
      [id]
    );
    res.json({ message: "Prescription marked as ended" });
  } catch (err) {
    throw new InternalServerError(
      "Internal server error while ending prescription"
    );
  }
};

const getPrescriptionsByDoctor = async (req, res) => {
  const userId = req.user.userId;
  try {
    const dr = await db.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [userId]
    );
    const doctor_id = dr.rows[0]?.id;
    if (!doctor_id) {
      throw new NotFoundError("Doctor not found");
    }

    const result = await db.query(
      `
      SELECT p.id,
             d.name AS drug_name,
             pat.first_name || ' ' || pat.last_name AS patient_name,
             p.dosage,
             p.instructions,
             p.prescribed_at,
             p.end_date
        FROM prescriptions p
        JOIN drugs d    ON p.drug_id    = d.id
        JOIN patients pat ON p.patient_id = pat.id
       WHERE p.doctor_id = $1
    ORDER BY p.prescribed_at DESC
      `,
      [doctor_id]
    );
    res.json(result.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError("Doctor Prescription Fetch Error");
  }
};

const getPrescriptionsForPatient = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await db.query(
      `
      SELECT p.id,
             d.name  AS name,
             doc.first_name || ' ' || doc.last_name AS doctor,
             p.dosage,
             p.instructions,
             p.prescribed_at,
             p.end_date
        FROM prescriptions p
        JOIN drugs d    ON p.drug_id    = d.id
        JOIN doctors doc ON p.doctor_id  = doc.id
        JOIN patients pat ON p.patient_id = pat.id
       WHERE pat.user_id = $1
    ORDER BY p.prescribed_at DESC
      `,
      [userId]
    );

    const now = new Date();
    const active = result.rows.filter(
      (p) => !p.end_date || new Date(p.end_date) > now
    );
    const history = result.rows.filter(
      (p) => p.end_date && new Date(p.end_date) <= now
    );
    res.json({ active, history });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError("Fetch Prescription Error");
  }
};

module.exports = {
  addPrescription,
  endPrescription,
  getPrescriptionsByDoctor,
  getPrescriptionsForPatient
};
