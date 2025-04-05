const db = require("../db");

const addPatientSymptom = async (req, res) => {
  const userId = req.user.userId;
  const { name, description, severity, duration, notes } = req.body;

  try {
    const patientResult = await db.query("SELECT id FROM patients WHERE user_id = $1", [userId]);
    const patient = patientResult.rows[0];
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const symptomResult = await db.query(
      "INSERT INTO symptoms (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description RETURNING id",
      [name.trim(), description || ""]
    );
    const symptomId = symptomResult.rows[0].id;

    await db.query(
      `INSERT INTO patient_symptoms (patient_id, symptom_id, severity, duration, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [patient.id, symptomId, severity, duration, notes]
    );

    res.status(201).json({ message: "Symptom logged" });
  } catch (err) {
    console.error("Add Symptom Error:", err);
    res.status(500).json({ message: "Server error" });
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
