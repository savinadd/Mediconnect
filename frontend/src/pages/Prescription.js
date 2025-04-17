import React, { useEffect, useRef, useState, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import "../styles/Prescription.css";
import { AuthContext } from "../context/AuthContext";

const Prescriptions = () => {
  const { userId, userRole: role, isLoggedIn } = useContext(AuthContext);

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
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn || !role) return;
    if (role === "patient") fetchPrescriptions();
    else fetchDoctorPrescriptions();
  }, [isLoggedIn, role]);

  useEffect(() => {
    if (formData.drugName.trim() === "") {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const fetchDrugSuggestions = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/drugs/search?query=${encodeURIComponent(formData.drugName)}`
        );
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
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/prescriptions/my`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        setActivePrescriptions(data.active || []);
        setHistory(data.history || []);
      } else {
        toast.error(data.message || "Failed to load prescriptions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error loading prescriptions");
    }
  };
  const fetchDoctorPrescriptions = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/prescriptions/by-doctor`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) {
        const active = data.filter(p => !p.end_date || new Date(p.end_date) > new Date());
        const inactive = data.filter(p => p.end_date && new Date(p.end_date) <= new Date());
        setActivePrescriptions(active);
        setInactivePrescriptions(inactive);
      } else {
        toast.error(data.message || "Failed to load doctor prescriptions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error loading doctor prescriptions");
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSelectDrug = name => {
    setFormData(f => ({ ...f, drugName: name }));
    setShowSearchDropdown(false);
  };

  const handlePrescribe = async e => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/prescriptions/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData)
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Prescription successfully created");

        setFormData({
          patientName: "",
          patientDob: "",
          patientId: "",
          drugName: "",
          dosage: "",
          instructions: "",
          endDate: ""
        });
        setShowSearchDropdown(false);
        setTimeout(() => {
          if (role === "patient") fetchPrescriptions();
          else fetchDoctorPrescriptions();
        }, 500);
      } else {
        toast.error(data.message || "Failed to create prescription");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while prescribing");
    }
  };


  const handleEndPrescription = async id => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/prescriptions/end/${id}`,
        {
          method: "PUT",
          credentials: "include"
        }
      );
      if (res.ok) {
        toast.success("Prescription ended successfully");

        const moved = activePrescriptions.find(p => p.id === id);
        if (moved) {
          setActivePrescriptions(ap => ap.filter(p => p.id !== id));
          if (role === "doctor") {
            setInactivePrescriptions(ip => [
              ...ip,
              { ...moved, end_date: new Date().toISOString() }
            ]);
          } else {
            setHistory(h => [...h, { ...moved, end_date: new Date().toISOString() }]);
          }
        }
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to end prescription");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error ending prescription");
    }
  };

  return (
    <>
<div className="prescriptions-container">
        <h1>Prescriptions</h1>

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
              <div className="drug-search-group" ref={dropdownRef}>
                <input
                  type="text"
                  name="drugName"
                  placeholder="Select Drug"
                  value={formData.drugName}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
                {showSearchDropdown && searchResults.length > 0 && (
                  <ul className="drug-suggestions">
                    {searchResults.map(drug => (
                      <li key={drug.id} onClick={() => handleSelectDrug(drug.name)}>
                        {drug.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                placeholder="Optional End Date"
              />
              <button type="submit">Submit Prescription</button>
            </form>
          </div>
        )}

        <h2>
          {role === "doctor"
            ? "Active Prescriptions You've Written"
            : "Active Prescriptions"}
        </h2>
        <div className="active-prescriptions">
          {activePrescriptions.length > 0 ? (
            activePrescriptions.map(pres => (
              <div className="prescription-card" key={pres.id}>
                <div className="prescription-header">
                  <span className="prescription-name">
                    {pres.name || pres.drug_name}
                  </span>
                  <span className="prescription-status active">Active</span>
                </div>
                {role !== "doctor" && <p className="doctor">Prescribed by {pres.doctor}</p>}
                {role === "doctor" && <p className="doctor">Patient: {pres.patient_name}</p>}
                <div className="prescription-details">
                  <p>
                    <strong>Prescribed:</strong>{" "}
                    {new Date(pres.prescribed_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Dosage:</strong> {pres.dosage}
                  </p>
                  <p>
                    <strong>Instructions:</strong> {pres.instructions}
                  </p>
                  {pres.end_date && (
                    <p>
                      <strong>Ends on:</strong>{" "}
                      {new Date(pres.end_date).toLocaleDateString()}
                    </p>
                  )}
                  {role === "doctor" && (
                    <button
                      className="end-button"
                      onClick={() => handleEndPrescription(pres.id)}
                    >
                      End Prescription
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-prescriptions">
              No active prescriptions found. Once a doctor writes you a
              prescription, you will see it here.
            </p>
          )}
        </div>

        {role === "doctor" && (
          <>
            <h2>Inactive Prescriptions</h2>
            <div className="active-prescriptions">
              {inactivePrescriptions.length > 0 ? (
                inactivePrescriptions.map(pres => (
                  <div className="prescription-card" key={pres.id}>
                    <div className="prescription-header">
                      <span className="prescription-name">
                        {pres.name || pres.drug_name}
                      </span>
                      <span className="prescription-status inactive">
                        Inactive
                      </span>
                    </div>
                    <p className="doctor">Patient: {pres.patient_name}</p>
                    <div className="prescription-details">
                      <p>
                        <strong>Prescribed:</strong>{" "}
                        {new Date(pres.prescribed_at).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Dosage:</strong> {pres.dosage}
                      </p>
                      <p>
                        <strong>Instructions:</strong> {pres.instructions}
                      </p>
                      {pres.end_date && (
                        <p>
                          <strong>Ended on:</strong>{" "}
                          {new Date(pres.end_date).toLocaleDateString()}
                        </p>
                      )}
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
  {history.map((entry, idx) => (
    <tr key={idx}>
      <td data-label="Medication">{entry.name}</td>
      <td data-label="Doctor">{entry.doctor}</td>
      <td data-label="Date">{new Date(entry.prescribed_at).toLocaleDateString()}</td>
      <td data-label="Status" className="status completed">Completed</td>
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
    </>
  );
};

export default Prescriptions;
