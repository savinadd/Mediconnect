import React, { useState } from "react";

const AddPrescription = () => {
  const [form, setForm] = useState({
    patient_name: "",
    dob: "",
    patient_id: "",
    drug_id: "",
    dosage: "",
    instructions: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/prescriptions/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Prescription added!");
        setForm({ patient_name: "", dob: "", patient_id: "", drug_id: "", dosage: "", instructions: "" });
      } else {
        setMessage(data.message || "Failed to add prescription");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("Server error");
    }
  };

  return (
    <div>
      <h2>Add Prescription</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="patient_name" placeholder="Full Name" onChange={handleChange} required />
        <input name="dob" type="date" onChange={handleChange} required />
        <input name="patient_id" placeholder="Patient ID" onChange={handleChange} required />
        <input name="drug_id" placeholder="Drug ID" onChange={handleChange} required />
        <input name="dosage" placeholder="Dosage" onChange={handleChange} required />
        <input name="instructions" placeholder="Instructions" onChange={handleChange} />
        <button type="submit">Add Prescription</button>
      </form>
    </div>
  );
};

export default AddPrescription;
