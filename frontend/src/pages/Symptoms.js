import React, { useState, useEffect } from "react";
import "../styles/Symptoms.css";

const Symptoms = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    severity: "",
    duration: "",
    notes: ""
  });

  const [history, setHistory] = useState([]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSymptomSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/symptoms/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Symptom logged!");
        setFormData({ name: "", description: "", severity: "", duration: "", notes: "" });
        fetchSymptomHistory();
      } else {
        alert(data.message || "Error logging symptom");
      }
    } catch (err) {
      console.error("Symptom Log Error:", err);
    }
  };

  const fetchSymptomHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/symptoms/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data);
      }
    } catch (err) {
      console.error("Error fetching symptom history:", err);
    }
  };

  useEffect(() => {
    fetchSymptomHistory();
  }, []);

  return (
    <div className="symptoms-container">
      <h1>Symptom Tracker</h1>
      <p>Monitor and log your symptoms to share with healthcare professionals</p>

      <form className="log-form" onSubmit={handleSymptomSubmit}>
  <div className="form-group">
    <input name="name" placeholder="Symptom name" value={formData.name} onChange={handleInputChange} required />
    <input name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} />
  </div>

  <div className="form-group">
    <select
      name="severity"
      value={formData.severity}
      onChange={handleInputChange}
      className={`severity-select ${formData.severity.toLowerCase()}`}
      required
    >
      <option value="">Select Severity</option>
      <option value="Mild">Mild</option>
      <option value="Moderate">Moderate</option>
      <option value="Severe">Severe</option>
      <option value="Critical">Critical</option>
    </select>

    <input name="duration" placeholder="Duration (e.g. 2 hours)" value={formData.duration} onChange={handleInputChange} />
  </div>

  <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleInputChange} />

  <button type="submit" className="submit-button">Submit Symptom</button>
</form>



      <h2>Symptom History</h2>
      {history.length > 0 ? (
        <table className="symptom-history">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symptom</th>
              <th>Severity</th>
              <th>Duration</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index}>
                <td>{new Date(entry.logged_at).toLocaleString()}</td>
                <td>{entry.symptom_name}</td>
                <td>
  <span className={`severity-tag ${entry.severity?.toLowerCase()}`}>
    {entry.severity}
  </span>
</td>

                <td>{entry.duration}</td>
                <td>{entry.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-history">No symptom history available.</p>
      )}
    </div>
  );
};

export default Symptoms;
