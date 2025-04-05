const db = require("../db");

const addPrescription = async (req, res) => {
  const { patient_name, dob, patient_id, drug_id, dosage, instructions } = req.body;
  const doctor_user_id = req.user.userId;

  try {

    const doctorResult = await db.query("SELECT id FROM doctors WHERE user_id = $1", [doctor_user_id]);
    const doctor_id = doctorResult.rows[0]?.id;

    if (!doctor_id) return res.status(400).json({ message: "Doctor not found" });

    const patientResult = await db.query(
      "SELECT id FROM patients WHERE id = $1 AND birth_date = $2 AND CONCAT(first_name, ' ', last_name) ILIKE $3",
      [patient_id, dob, `%${patient_name}%`]
    );
    const patient = patientResult.rows[0];

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    await db.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, drug_id, dosage, instructions)
       VALUES ($1, $2, $3, $4, $5)`,
      [patient.id, doctor_id, drug_id, dosage, instructions]
    );

    res.status(201).json({ message: "Prescription added successfully" });
  } catch (err) {
    console.error("Add Prescription Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getPrescriptionsForPatient = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(`
      SELECT p.id, d.name AS drug_name, doc.first_name || ' ' || doc.last_name AS doctor_name,
             p.dosage, p.instructions, p.prescribed_at
      FROM prescriptions p
      JOIN drugs d ON p.drug_id = d.id
      JOIN doctors doc ON p.doctor_id = doc.id
      JOIN patients pat ON p.patient_id = pat.id
      WHERE pat.user_id = $1
      ORDER BY p.prescribed_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Prescription Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addPrescription, getPrescriptionsForPatient };
