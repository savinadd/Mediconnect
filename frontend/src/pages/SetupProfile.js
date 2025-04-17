import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/SetupProfile.css";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const SetupProfile = () => {
  const { login } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    birth_date: "",
    blood_type: "",   
    height: "",
    weight: "",
    allergies: "",
    specialization: "",
    license_number: "",
    government_id: "",
    department: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrationRole = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/registration-role`,
          { credentials: "include" }
        );
        if (res.ok) {
          const { role } = await res.json();
          setRole(role);
        } else {
          setError("Unable to retrieve registration details. Please log in again.");
        }
      } catch (err) {
        console.error(err);
        setError("Server error. Please try again later.");
      }
    };
    fetchRegistrationRole();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile/setup`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user.id, data.user.role);
        navigate("/profile");
      } else {
        setError(data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  if (!role) return <p>Loading registration details…</p>;
  return (
    <div className="setup-container">
      <div className="setup-box">
        <h2>Complete Your Profile</h2>
        {error && <p className="setup-message" style={{ color: "red" }}>{error}</p>}
        
        {role ? (
          <form onSubmit={handleSubmit}>
        
            <input
              className="setup-input"
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <input
              className="setup-input"
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            <input
              className="setup-input"
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              className="setup-input"
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
                  className="setup-input"
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                />
                <select name="blood_type" value={formData.blood_type} onChange={handleChange} required>
                  <option value="" disabled>Select Blood Type</option>
                  {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
                <input
                  className="setup-input"
                  type="number"
                  name="height"
                  placeholder="Height (cm)"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
                <input
                  className="setup-input"
                  type="number"
                  name="weight"
                  placeholder="Weight (kg)"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
                <input
                  className="setup-input"
                  type="text"
                  name="allergies"
                  placeholder="Allergies (comma separated)"
                  value={formData.allergies}
                  onChange={handleChange}
                  required
                />
                <input
                  className="setup-input"
                  type="text"
                  name="government_id"
                  placeholder="Government ID"
                  value={formData.government_id}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {role === "doctor" && (
              <>
                <input
                  className="setup-input"
                  type="text"
                  name="specialization"
                  placeholder="Specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                />
                <input
                  className="setup-input"
                  type="text"
                  name="license_number"
                  placeholder="License Number"
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                />
              </>
            )}


            <button type="submit" className="setup-button">
              Save Profile
            </button>
          </form>
        ) : (
          <p>Loading registration details…</p>
        )}
      </div>
    </div>
  );
};

export default SetupProfile;
