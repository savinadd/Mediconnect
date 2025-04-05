import React, { useEffect, useState } from "react";
import "../styles/Medications.css";

const Prescriptions = () => {
  const [role, setRole] = useState(""); 
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    patientName: "",
    patientDob: "",
    patientId: "",
    drugName: "",
    dosage: "",
    instructions: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    setRole(userRole);

    const fetchPrescriptions = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/prescriptions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setActivePrescriptions(data.active || []);
          setHistory(data.history || []);
        } else {
          setMessage("Failed to fetch prescriptions");
        }
      } catch (err) {
        console.error("Error:", err);
        setMessage("Server error while fetching prescriptions");
      }
    };

    fetchPrescriptions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrescribe = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:3000/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Prescription successfully created");
        setFormData({
          patientName: "",
          patientDob: "",
          patientId: "",
          drugName: "",
          dosage: "",
          instructions: "",
        });
      } else {
        setMessage(data.message || "Failed to create prescription");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Server error while prescribing");
    }
  };

  return (
    <div className="prescriptions-container">
      <h1>Prescriptions</h1>
      {message && <p className="message">{message}</p>}

      {role === "doctor" && (
        <div className="prescription-form">
          <h2>Prescribe Medication</h2>
          <form onSubmit={handlePrescribe}>
            <input
              type="text"
              name="patientName"
              placeholder="Patient Full Name"
              value={formData.patientName}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="patientDob"
              value={formData.patientDob}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="patientId"
              placeholder="Patient ID"
              value={formData.patientId}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="drugName"
              placeholder="Drug Name"
              value={formData.drugName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="dosage"
              placeholder="Dosage"
              value={formData.dosage}
              onChange={handleChange}
              required
            />
            <textarea
              name="instructions"
              placeholder="Instructions"
              value={formData.instructions}
              onChange={handleChange}
              required
            />
            <button type="submit">Submit Prescription</button>
          </form>
        </div>
      )}

      <h2>Active Prescriptions</h2>
      <div className="active-prescriptions">
        {activePrescriptions.length > 0 ? (
          activePrescriptions.map((prescription) => (
            <div className="prescription-card" key={prescription.id}>
              <div className="prescription-header">
                <span className="prescription-name">{prescription.name}</span>
                <span className="prescription-status">Active</span>
              </div>
              <p className="doctor">Prescribed by {prescription.doctor}</p>
              <div className="prescription-details">
                <p><strong>Prescribed:</strong> {new Date(prescription.prescribed_at).toLocaleDateString()}</p>
                <p><strong>Dosage:</strong> {prescription.dosage}</p>
                <p><strong>Instructions:</strong> {prescription.instructions}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-prescriptions">No active prescriptions found.</p>
        )}
      </div>

      <h2>Prescription History</h2>
      {history.length > 0 ? (
        <table className="prescription-history">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index}>
                <td>{entry.name}</td>
                <td>{entry.doctor}</td>
                <td>{new Date(entry.prescribed_at).toLocaleDateString()}</td>
                <td className="status completed">Completed</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-history">No prescription history available.</p>
      )}
    </div>
  );
};

export default Prescriptions;
