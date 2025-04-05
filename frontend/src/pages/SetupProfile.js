import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/SetupProfile.css";

const SetupProfile = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded role:", decoded.role);
      setRole(decoded.role);
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const fullName = `${formData.first_name} ${formData.last_name}`;
    const formDataToSend = { ...formData, name: fullName };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => navigate("/profile"), 1000);
      } else {
        setMessage(data.message || "Error updating profile.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error. Please try again.");
    }
  };

  if (!role) return <div>Loading setup form...</div>;

  return (
    <div className="setup-container">
      <div className="setup-box">
        <h2>Complete Your Profile</h2>
        {message && <p className="setup-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="first_name" placeholder="First Name" className="setup-input" onChange={handleChange} required />
          <input type="text" name="last_name" placeholder="Last Name" className="setup-input" onChange={handleChange} required />

          {role === "patient" && (
            <>
              <input type="date" name="birth_date" className="setup-input" onChange={handleChange} required />
              <input type="text" name="phone" placeholder="Phone" className="setup-input" onChange={handleChange} />
              <input type="text" name="address" placeholder="Address" className="setup-input" onChange={handleChange} />
              <input type="text" name="blood_type" placeholder="Blood Type" className="setup-input" onChange={handleChange} />
              <input type="number" name="height" placeholder="Height (cm)" className="setup-input" onChange={handleChange} />
              <input type="number" name="weight" placeholder="Weight (kg)" className="setup-input" onChange={handleChange} />
              <input type="text" name="allergies" placeholder="Allergies" className="setup-input" onChange={handleChange} />
            </>
          )}

          {role === "doctor" && (
            <>
              <input type="text" name="specialization" placeholder="Specialization" className="setup-input" onChange={handleChange} required />
              <input type="text" name="license_number" placeholder="License Number" className="setup-input" onChange={handleChange} required />
              <input type="text" name="phone" placeholder="Phone" className="setup-input" onChange={handleChange} />
              <input type="text" name="address" placeholder="Address" className="setup-input" onChange={handleChange} />
            </>
          )}

          <button type="submit" className="setup-button">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;
