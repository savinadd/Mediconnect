import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/EditProfile.css";
import toast from 'react-hot-toast';

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EditProfile = () => {
  const navigate = useNavigate();
  const { userRole: role } = useContext(AuthContext);
  const [errors, setErrors] = useState([]);
  const [profileData, setProfileData] = useState({
    first_name:    "",
    last_name:     "",
    birth_date:    "",
    email:         "",
    phone:         "",
    address:       "",
    blood_type:    "",
    height:        "",
    weight:        "",
    allergies:     "",
    government_id: "",
    specialization:"",
    license_number:""
  });

  useEffect(() => {
    if (!role) return;
  
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        const isoDate = data.birth_date
          ? new Date(data.birth_date).toISOString().slice(0, 10)
          : "";
  
        setProfileData({
          first_name:     data.first_name     || "",
          last_name:      data.last_name      || "",
          birth_date:     isoDate,
          email:          data.email          || "",
          phone:          data.phone          || "",
          address:        data.address        || "",
          blood_type:     data.blood_type     || "",
          height:         data.height         || "",
          weight:         data.weight         || "",
          allergies:      data.allergies      || "",
          government_id:  data.government_id  || "",
          specialization: data.specialization || "",
          license_number: data.license_number || "",
        });
      });
  }, [role]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/profile/edit`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(profileData),
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully!");
        navigate("/profile");
      } else {
        setErrors(data.errors || [{ msg: data.message }]);
      }
    } catch (err) {

      setErrors([{ msg: "Server error, please try again." }]);
    }
  };

  return (
    <div className="edit-profile-container">
      <h1 className="title">Edit Profile</h1>
      {errors.length > 0 && (
        <div className="error-box">
          <ul>
            {errors.map((e, i) => <li key={i}>{e.msg}</li>)}
          </ul>
        </div>
      )}
      <form className="edit-profile-form" onSubmit={handleSubmit}>
      
        <div className="form-section">
          <h3>Personal Information</h3>
          <label>First Name *</label>
          <input
            name="first_name"
            value={profileData.first_name}
            onChange={handleChange}
            required
          />
          <label>Last Name *</label>
          <input
            name="last_name"
            value={profileData.last_name}
            onChange={handleChange}
            required
          />

          {role === "patient" && (
            <>
              <label>Date of Birth *</label>
              <input
                type="date"
                name="birth_date"
                value={profileData.birth_date}
                onChange={handleChange}
                required
              />

              <label>Government ID *</label>
              <input
                name="government_id"
                value={profileData.government_id}
                readOnly
              />
            </>
          )}

          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            readOnly
          />

          <label>Phone *</label>
          <input
            name="phone"
            value={profileData.phone}
            onChange={handleChange}
            required
          />

          <label>{role === "doctor" ? "Hospital Address *" : "Address *"}</label>
          <input
            name="address"
            value={profileData.address}
            onChange={handleChange}
            required
          />
        </div>

        {role === "patient" && (
          <div className="form-section">
            <h3>Medical Information</h3>
            <label>Blood Type *</label>
            <select
              name="blood_type"
              value={profileData.blood_type}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>

            <label>Height (cm) *</label>
            <input
              name="height"
              value={profileData.height}
              onChange={handleChange}
              required
            />

            <label>Weight (kg) *</label>
            <input
              name="weight"
              value={profileData.weight}
              onChange={handleChange}
              required
            />

            <label>Allergies *</label>
            <input
              name="allergies"
              value={profileData.allergies}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {role === "doctor" && (
          <div className="form-section">
            <h3>Professional Info</h3>
            <label>Specialization *</label>
            <input
              name="specialization"
              value={profileData.specialization}
              onChange={handleChange}
              required
            />

            <label>License Number *</label>
            <input
              name="license_number"
              value={profileData.license_number}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="form-buttons">
          <button type="submit" className="save-btn">Save Profile</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
