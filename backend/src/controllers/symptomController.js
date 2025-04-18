const db = require("../db");
const { BadRequestError, NotFoundError, InternalServerError, AppError } = require("../utils/errors");
const { logActivity } = require("./activityLogController");
const { z } = require("zod");

const symptomSchema = z.object({
  symptomName: z.string().optional().trim(),
  name:         z.string().optional().trim(),
  description:  z.string().nonempty({ message: "Description is required" }).trim(),
  severity:     z.string().optional().trim(),
  duration:     z.string().optional().trim(),
  notes:        z.string().optional().trim(),
});

const addPatientSymptom = async (req, res) => {

  const parseResult = symptomSchema.safeParse(req.body);
  if (!parseResult.success) {

    const messages = parseResult.error.errors.map((e) => e.message);
    throw new BadRequestError(messages);
  }

  const userId = req.user.userId;
  const role   = req.user.role;
  const { symptomName, name, description, severity, duration, notes } = parseResult.data;
  const finalSymptomName = symptomName || name;

  try {

    const patientResult = await db.query(
      "SELECT id FROM patients WHERE user_id = $1",
      [userId]
    );
    const patient = patientResult.rows[0];
    if (!patient) throw new NotFoundError("Patient not found.");

    let symptomId;
    const existing = await db.query(
      "SELECT id FROM symptoms WHERE name ILIKE $1",
      [finalSymptomName]
    );
    if (existing.rows.length > 0) {
      symptomId = existing.rows[0].id;
    } else {
      const insertSym = await db.query(
        `INSERT INTO symptoms (name, description)
         VALUES ($1, $2) RETURNING id`,
        [finalSymptomName, description]
      );
      symptomId = insertSym.rows[0].id;
    }

    await db.query(
      `INSERT INTO patient_symptoms
         (patient_id, symptom_id, severity, duration, notes)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        patient.id,
        symptomId,
        severity || null,
        duration || null,
        notes    || null,
      ]
    );


    await logActivity(userId, role, `Logged symptom: ${finalSymptomName}`);
    return res.status(201).json({ message: "Symptom logged successfully" });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError("Server error while adding symptom");
  }
};

const getPatientSymptomHistory = async (req, res) => {
  const userId = req.user.userId;
  try {
    const patientResult = await db.query(
      "SELECT id FROM patients WHERE user_id = $1",
      [userId]
    );
    const patient = patientResult.rows[0];
    if (!patient) throw new NotFoundError("Patient not found");

    const historyResult = await db.query(
      `SELECT ps.logged_at,
              s.name AS symptom_name,
              ps.severity,
              ps.duration,
              ps.notes
         FROM patient_symptoms ps
         JOIN symptoms s ON ps.symptom_id = s.id
        WHERE ps.patient_id = $1
        ORDER BY ps.logged_at DESC`,
      [patient.id]
    );

    return res.json(historyResult.rows);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new InternalServerError("Fetch Symptom History Error");
  }
};

module.exports = { addPatientSymptom, getPatientSymptomHistory };
