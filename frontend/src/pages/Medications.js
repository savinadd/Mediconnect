import React, { useState, useEffect } from "react";
import "../styles/Medications.css";

const Prescriptions = () => {
  // Example prescriptions data (Simulating API response)
  const [activePrescriptions, setActivePrescriptions] = useState([
    {
      id: 1,
      name: "Amoxicillin 500mg",
      doctor: "Dr. Sarah Johnson",
      startDate: "Jan 15, 2025",
      endDate: "Jan 22, 2025",
      remaining: "5 days",
      dosage: "1 tablet three times daily",
      instructions: "Take with food. Complete the full course even if you feel better.",
      status: "Active"
    },
    {
      id: 2,
      name: "Ibuprofen 200mg",
      doctor: "Dr. Sarah Johnson",
      startDate: "Jan 15, 2025",
      endDate: "As needed",
      refills: "2 remaining",
      dosage: "1-2 tablets as needed",
      instructions: "Take with food or milk. Do not exceed 6 tablets in 24 hours.",
      status: "Active"
    }
  ]);

  // Example prescription history data
  const [history, setHistory] = useState([
    { name: "Amoxicillin 500mg", doctor: "Dr. Sarah Johnson", date: "Dec 10, 2024", status: "Completed" },
    { name: "Cetirizine 10mg", doctor: "Dr. Michael Chen", date: "Nov 25, 2024", status: "Completed" }
  ]);

  useEffect(() => {
    // Fetch prescriptions from an API here
    // If prescriptions list is empty, it should display "No prescriptions found."
  }, []);

  return (
    <div className="prescriptions-container">
      <h1>Prescriptions</h1>

      {/* Active Prescriptions */}
      <h2>Active Prescriptions</h2>
      <div className="active-prescriptions">
        {activePrescriptions.length > 0 ? (
          activePrescriptions.map((prescription) => (
            <div className="prescription-card" key={prescription.id}>
              <div className="prescription-header">
                <span className="prescription-name">{prescription.name}</span>
                <span className="prescription-status">{prescription.status}</span>
              </div>
              <p className="doctor">Prescribed by {prescription.doctor}</p>
              <div className="prescription-details">
                <p><strong>Start Date:</strong> {prescription.startDate}</p>
                <p><strong>End Date:</strong> {prescription.endDate}</p>
                {prescription.remaining && <p><strong>Remaining:</strong> {prescription.remaining}</p>}
                {prescription.refills && <p><strong>Refills:</strong> {prescription.refills}</p>}
                <p><strong>Dosage:</strong> {prescription.dosage}</p>
                <p><strong>Instructions:</strong> {prescription.instructions}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-prescriptions">No active prescriptions found.</p>
        )}
      </div>

      {/* Prescription History Table */}
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
                <td>{entry.date}</td>
                <td className={`status ${entry.status.toLowerCase()}`}>{entry.status}</td>
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
