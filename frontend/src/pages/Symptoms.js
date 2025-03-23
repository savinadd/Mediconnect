import React, { useState, useEffect } from "react";
import "../styles/Symptoms.css";

const Symptoms = () => {
  // Example symptoms data (Simulating API response)
  const [symptoms, setSymptoms] = useState([
    {
      id: 1,
      name: "Headache",
      severity: "Moderate Pain",
      duration: "2 hours",
      startTime: "Today, 2:30 PM",
      notes: "Pain concentrated on right side of head, accompanied by sensitivity to light.",
      color: "#FF6B6B"
    },
    {
      id: 2,
      name: "Shortness of Breath",
      severity: "Mild",
      duration: "30 minutes",
      startTime: "Today, 4:15 PM",
      notes: "Occurred after climbing stairs, improved with rest.",
      color: "#A78BFA"
    },
    {
      id: 3,
      name: "Nausea",
      severity: "Mild to Moderate",
      duration: "1 hour",
      startTime: "Today, 1:45 PM",
      notes: "Started after lunch, no vomiting, slight dizziness.",
      color: "#34D399"
    }
  ]);

  // Example past symptoms data
  const [history, setHistory] = useState([
    { date: "Mar 15, 2025", symptom: "Fever", severity: "High", duration: "6 hours", status: "Resolved" },
    { date: "Mar 14, 2025", symptom: "Joint Pain", severity: "Moderate", duration: "2 days", status: "Ongoing" }
  ]);

  useEffect(() => {
    // This is where you would fetch symptoms from an API
    // If symptoms list is empty, it should display "No symptoms logged yet."
  }, []);

  return (
    <div className="symptoms-container">
      <h1>Symptom Tracker</h1>
      <p>Monitor and log your symptoms to share with healthcare professionals</p>

      {/* Log New Symptom Button */}
      <button className="log-button">+ Log New Symptom</button>

      {/* Active Symptoms */}
      <div className="symptom-cards">
        {symptoms.length > 0 ? (
          symptoms.map((symptom) => (
            <div className="symptom-card" key={symptom.id}>
              <div className="symptom-header" style={{ backgroundColor: symptom.color }}>
                <span className="symptom-name">{symptom.name}</span>
                <span className="symptom-severity">{symptom.severity}</span>
              </div>
              <div className="symptom-details">
                <p><strong>Duration:</strong> {symptom.duration}</p>
                <p><strong>Started:</strong> {symptom.startTime}</p>
                <p><strong>Notes:</strong> {symptom.notes}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-symptoms">No symptoms logged yet.</p>
        )}
      </div>

      {/* Symptom History Table */}
      <h2>Symptom History</h2>
      {history.length > 0 ? (
        <table className="symptom-history">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symptom</th>
              <th>Severity</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.symptom}</td>
                <td>{entry.severity}</td>
                <td>{entry.duration}</td>
                <td className={`status ${entry.status.toLowerCase()}`}>{entry.status}</td>
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
