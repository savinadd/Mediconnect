const db = require("../db");
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
    return res.status(400).json({ message: "All fields are required." });
  }

  const userId = req.user.userId;
  const role = req.user.role;

  try {
    const doctorResult = await db.query("SELECT id FROM doctors WHERE user_id = $1", [userId]);
    const doctor_id = doctorResult.rows[0]?.id;

    if (!doctor_id) return res.status(400).json({ message: "Doctor not found" });

    const drugResult = await db.query("SELECT id FROM drugs WHERE name ILIKE $1", [drugName]);
    const drug_id = drugResult.rows[0]?.id;
    if (!drug_id) return res.status(404).json({ message: "Drug not found" });

    const patientResult = await db.query(
      `SELECT id FROM patients WHERE government_id = $1 AND CONCAT(first_name, ' ', last_name) = $2 AND birth_date = $3`,
      [patientId, patientName, patientDob]
    );
    const patient = patientResult.rows[0];
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    await db.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, drug_id, dosage, instructions, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [patient.id, doctor_id, drug_id, dosage, instructions, endDate || null]
    );

    await logActivity(userId, role, `Prescribed ${drugName} to ${patientName}`);
    return res.status(201).json({ message: "Prescription added successfully" });
  } catch (err) {
    console.error("Add Prescription Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

const endPrescription = async (req, res) => {
  const prescriptionId = req.params.id;
  try {
   
    await db.query(`UPDATE prescriptions SET end_date = CURRENT_DATE WHERE id = $1`, [prescriptionId]);
    res.json({ message: "Prescription marked as ended" });
  } catch (err) {
    console.error("End Prescription Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getPrescriptionsByDoctor = async (req, res) => {
  const doctorUserId = req.user.userId;
  try {
    const doctorResult = await db.query("SELECT id FROM doctors WHERE user_id = $1", [doctorUserId]);
    const doctor_id = doctorResult.rows[0]?.id;
    if (!doctor_id) return res.status(400).json({ message: "Doctor not found" });

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
    console.error("Doctor Prescription Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getPrescriptionsForPatient = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(`
      SELECT p.id, d.name AS name,
             doc.first_name || ' ' || doc.last_name AS doctor,
             p.dosage, p.instructions, p.prescribed_at, p.end_date
      FROM prescriptions p
      JOIN drugs d ON p.drug_id = d.id
      JOIN doctors doc ON p.doctor_id = doc.id
      JOIN patients pat ON p.patient_id = pat.id
      WHERE pat.user_id = $1
      ORDER BY p.prescribed_at DESC
    `, [userId]);

    const prescriptions = result.rows;

    const now = new Date();

    const active = prescriptions.filter(p => !p.end_date || new Date(p.end_date) > now);
    const history = prescriptions.filter(p => p.end_date && new Date(p.end_date) <= now);

    res.json({ active, history });
  } catch (err) {
    console.error("Fetch Prescription Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addPrescription, endPrescription, getPrescriptionsByDoctor, getPrescriptionsForPatient };
