import React, { useEffect, useRef, useState } from "react";
import "../styles/Medications.css";

const Prescriptions = () => {
  const [role, setRole] = useState("");
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [inactivePrescriptions, setInactivePrescriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    patientName: "",
    patientDob: "",
    patientId: "",
    drugName: "",
    dosage: "",
    instructions: "",
    endDate: ""
  });
  const [message, setMessage] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const fetchPrescriptions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/prescriptions/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActivePrescriptions(data.active || []);
        setHistory(data.history || []);
      } else {
        setMessage(data.message || "Failed to fetch prescriptions");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Server error while fetching prescriptions");
    }
  };

  const fetchDoctorPrescriptions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/prescriptions/by-doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const active = data.filter(p => !p.end_date || new Date(p.end_date) > new Date());
        const inactive = data.filter(p => p.end_date && new Date(p.end_date) <= new Date());
        setActivePrescriptions(active);
        setInactivePrescriptions(inactive);
      } else {
        setMessage(data.message || "Failed to fetch prescriptions");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Server error while fetching prescriptions");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    setRole(userRole);
    if (token && userRole === "patient") fetchPrescriptions();
    else if (token && userRole === "doctor") fetchDoctorPrescriptions();
  }, []);

  useEffect(() => {
    const fetchDrugSuggestions = async () => {
      if (formData.drugName.trim() === "") {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/drugs/search?query=${formData.drugName}`);
        const data = await res.json();
        setSearchResults(data);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error("Error searching drugs:", err);
      }
    };
    fetchDrugSuggestions();
  }, [formData.drugName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectDrug = (name) => {
    setFormData({ ...formData, drugName: name });
    setShowSearchDropdown(false);
  };

  const handlePrescribe = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const payload = {
      patientName: formData.patientName,
      patientDob: formData.patientDob,
      patientId: formData.patientId,
      drugName: formData.drugName,
      dosage: formData.dosage,
      instructions: formData.instructions,
      endDate: formData.endDate,
    };
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/prescriptions/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
          endDate: "",
        });
        setShowSearchDropdown(false);
        setTimeout(() => {
          if (role === "patient") fetchPrescriptions();
          else fetchDoctorPrescriptions();
        }, 500);
      } else {
        setMessage(data.message || "Failed to create prescription");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Server error while prescribing");
    }
  };

  const handleEndPrescription = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/prescriptions/end/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage("Prescription ended successfully");
        const moved = activePrescriptions.find(p => p.id === id);
        if (moved) {
          const updatedActive = activePrescriptions.filter(p => p.id !== id);
          const endedPrescription = { ...moved, end_date: new Date().toISOString() };
        
          setActivePrescriptions(updatedActive);
        
          if (role === "doctor") {
            setInactivePrescriptions([...inactivePrescriptions, endedPrescription]);
          } else if (role === "patient") {
            setHistory([...history, endedPrescription]);
          }
        }
        
      }
    } catch (err) {
      console.error("Error ending prescription", err);
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
            <input type="text" name="patientName" placeholder="Patient Full Name" value={formData.patientName} onChange={handleChange} required />
            <input type="date" name="patientDob" value={formData.patientDob} onChange={handleChange} required />
            <input type="text" name="patientId" placeholder="Patient ID" value={formData.patientId} onChange={handleChange} required />
            <div className="drug-search-group" ref={dropdownRef}>
              <input type="text" name="drugName" placeholder="Select Drug" value={formData.drugName} onChange={handleChange} autoComplete="off" required />
              {showSearchDropdown && searchResults.length > 0 && (
                <ul className="drug-suggestions">
                  {searchResults.map((drug) => (
                    <li key={drug.id} onClick={() => handleSelectDrug(drug.name)}>{drug.name}</li>
                  ))}
                </ul>
              )}
            </div>
            <input type="text" name="dosage" placeholder="Dosage" value={formData.dosage} onChange={handleChange} required />
            <textarea name="instructions" placeholder="Instructions" value={formData.instructions} onChange={handleChange} required />
            <input type="date" name="endDate" value={formData.endDate || ""} onChange={handleChange} placeholder="Optional End Date" />
            <button type="submit">Submit Prescription</button>
          </form>
        </div>
      )}
      <h2>{role === "doctor" ? "Active Prescriptions You've Written" : "Active Prescriptions"}</h2>
      <div className="active-prescriptions">
        {Array.isArray(activePrescriptions) && activePrescriptions.length > 0 ? (
          activePrescriptions.map((prescription) => (
            <div className="prescription-card" key={prescription.id}>
              <div className="prescription-header">
                <span className="prescription-name">{prescription.name || prescription.drug_name}</span>
                <span className="prescription-status active">Active</span>
              </div>
              {role !== "doctor" && <p className="doctor">Prescribed by {prescription.doctor}</p>}
              {role === "doctor" && <p className="doctor">Patient: {prescription.patient_name}</p>}
              <div className="prescription-details">
                <p><strong>Prescribed:</strong> {new Date(prescription.prescribed_at).toLocaleDateString()}</p>
                <p><strong>Dosage:</strong> {prescription.dosage}</p>
                <p><strong>Instructions:</strong> {prescription.instructions}</p>
                {prescription.end_date && <p><strong>Ends on:</strong> {new Date(prescription.end_date).toLocaleDateString()}</p>}
                {role === "doctor" && (
                  <button onClick={() => handleEndPrescription(prescription.id)}>
                    End Prescription
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-prescriptions">No active prescriptions found.</p>
        )}
      </div>
      {role === "doctor" && (
        <>
          <h2>Inactive Prescriptions</h2>
          <div className="active-prescriptions">
            {inactivePrescriptions.length > 0 ? (
              inactivePrescriptions.map((prescription) => (
                <div className="prescription-card" key={prescription.id}>
                  <div className="prescription-header">
                    <span className="prescription-name">{prescription.name || prescription.drug_name}</span>
                    <span className="prescription-status inactive">Inactive</span>
                  </div>
                  <p className="doctor">Patient: {prescription.patient_name}</p>
                  <div className="prescription-details">
                    <p><strong>Prescribed:</strong> {new Date(prescription.prescribed_at).toLocaleDateString()}</p>
                    <p><strong>Dosage:</strong> {prescription.dosage}</p>
                    <p><strong>Instructions:</strong> {prescription.instructions}</p>
                    {prescription.end_date && <p><strong>Ended on:</strong> {new Date(prescription.end_date).toLocaleDateString()}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-prescriptions">No inactive prescriptions found.</p>
            )}
          </div>
        </>
      )}
      {role === "patient" && (
        <>
          <h2>Prescription History</h2>
          {Array.isArray(history) && history.length > 0 ? (
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
        </>
      )}
    </div>
  );
};

export default Prescriptions;
