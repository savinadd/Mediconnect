import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SetupProfile.css";
import { AuthContext } from "../context/AuthContext";

const SetupProfile = () => {
  const { userRole: role } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    phone: "",
    address: "",
    blood_type: "",
    height: "",
    weight: "",
    allergies: "",
    specialization: "",
    license_number: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/profile");
      } else {
        setError(data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Profile setup error:", err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="profile-setup-container">
      <h2>Complete Your Profile</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="profile-setup-form">
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        {role === "patient" && (
          <>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="blood_type"
              placeholder="Blood Type"
              value={formData.blood_type}
              onChange={handleChange}
            />
            <input
              type="number"
              name="height"
              placeholder="Height (cm)"
              value={formData.height}
              onChange={handleChange}
            />
            <input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              value={formData.weight}
              onChange={handleChange}
            />
            <input
              type="text"
              name="allergies"
              placeholder="Allergies (comma separated)"
              value={formData.allergies}
              onChange={handleChange}
            />
          </>
        )}

        {role === "doctor" && (
          <>
            <input
              type="text"
              name="specialization"
              placeholder="Specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="license_number"
              placeholder="License Number"
              value={formData.license_number}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit" className="submit-button">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default SetupProfile;
