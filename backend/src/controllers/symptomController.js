const db = require("../db");
const { logActivity } = require("./activityLogController");
const { validationResult } = require("express-validator");

const addPatientSymptom = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.userId;
  const role = req.user.role;
  const {
    symptomName,
    name,
    description,
    severity,
    duration,
    notes
  } = req.body;

  const finalSymptomName = symptomName || name;

  try {
    const patientResult = await db.query("SELECT id FROM patients WHERE user_id = $1", [userId]);
    const patient = patientResult.rows[0];
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    let symptomId;
    const existingSymptom = await db.query("SELECT id FROM symptoms WHERE name ILIKE $1", [finalSymptomName]);
    if (existingSymptom.rows.length > 0) {
      symptomId = existingSymptom.rows[0].id;
    } else {
      const newSymptom = await db.query(
        "INSERT INTO symptoms (name, description) VALUES ($1, $2) RETURNING id",
        [finalSymptomName, description]
      );
      symptomId = newSymptom.rows[0].id;
    }

    await db.query(`
      INSERT INTO patient_symptoms (patient_id, symptom_id, severity, duration, notes)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      patient.id,
      symptomId,
      severity || null,
      duration || null,
      notes || null
    ]);

    await logActivity(userId, role, `Logged symptom: ${finalSymptomName}`);
    res.status(201).json({ message: "Symptom logged successfully" });
  } catch (err) {
    console.error("Add Symptom Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error while adding symptom" });
    }
  }
};

const getPatientSymptomHistory = async (req, res) => {
  const userId = req.user.userId;

  try {
    const patientResult = await db.query("SELECT id FROM patients WHERE user_id = $1", [userId]);
    const patient = patientResult.rows[0];
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const historyResult = await db.query(`
      SELECT ps.logged_at, s.name AS symptom_name, ps.severity, ps.duration, ps.notes
      FROM patient_symptoms ps
      JOIN symptoms s ON ps.symptom_id = s.id
      WHERE ps.patient_id = $1
      ORDER BY ps.logged_at DESC
    `, [patient.id]);

    res.json(historyResult.rows);
  } catch (err) {
    console.error("Fetch Symptom History Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addPatientSymptom, getPatientSymptomHistory };
