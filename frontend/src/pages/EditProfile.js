import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EditProfile.css";
import { AuthContext } from "../context/AuthContext";
import { z } from "zod";


const bloodTypes = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];


const baseSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(6, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
});

const patientSchema = baseSchema.extend({
  birth_date: z.string().min(1, "Birth date is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  allergies: z.string().min(1, "Allergies are required"),
  government_id: z.string().min(1, "Government ID is required")
});


const doctorSchema = baseSchema.extend({
  specialization: z.string().optional(),
  license_number: z.string().optional()
});

const adminSchema = baseSchema.extend({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
});

const EditProfile = () => {
  const navigate = useNavigate();
  const { userRole: role } = useContext(AuthContext);
  const [validationErrors, setValidationErrors] = useState([]);
  const [profileData, setProfileData] = useState({
    name: "",
    birth_date: "",
    email: "",
    phone: "",
    address: "",
    bloodType: "",
    height: "",
    weight: "",
    allergies: "",
    specialization: "",
    license_number: "",
    government_id: "",
  });


  useEffect(() => {
    if (!role) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setProfileData({
          name: `${data.first_name} ${data.last_name}`,
          birth_date: data.birth_date || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          bloodType: data.blood_type || "",
          height: data.height || "",
          weight: data.weight || "",
          allergies: data.allergies || "",
          specialization: data.specialization || "",
          license_number: data.license_number || "",
          government_id: data.government_id || ""
        });
      });
  }, [role]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors([]);

    const schema = role === "patient" ? patientSchema : role === "doctor" ? doctorSchema : adminSchema;

    try {
      schema.parse(profileData);

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(profileData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Profile saved!");
        navigate("/profile");
      } else {
        setValidationErrors(data.errors || [{ msg: data.message }]);
      }
    } catch (err) {
      if (err.errors) {
        setValidationErrors(err.errors.map((e) => ({ msg: e.message })));
      } else {
        setValidationErrors([{ msg: "Something went wrong" }]);
      }
    }
  };

  return (
    <div className="edit-profile-container">
      <h1>Edit Profile</h1>
      {validationErrors.length > 0 && (
        <div className="error-box">
          <ul>
            {validationErrors.map((e, i) => <li key={i}>{e.msg}</li>)}
          </ul>
        </div>
      )}
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <label>Full Name *</label>
          <input name="name" value={profileData.name} onChange={handleChange} />

          {role === "patient" && (
            <>
              <label>Date of Birth *</label>
              <input type="date" name="birth_date" value={profileData.birth_date} onChange={handleChange} />

              <label>Government ID *</label>
              <input name="government_id" value={profileData.government_id} readOnly />
            </>
          )}

          <label>Email *</label>
          <input type="email" name="email" value={profileData.email} readOnly />

          <label>Phone *</label>
          <input name="phone" value={profileData.phone} onChange={handleChange} />

          <label>{role === "doctor" ? "Hospital Address *" : "Address *"}</label>
          <input name="address" value={profileData.address} onChange={handleChange} />
        </div>

        {role === "patient" && (
          <div className="form-section">
            <h3>Medical Information</h3>
            <label>Blood Type *</label>
            <select name="bloodType" value={profileData.bloodType} onChange={handleChange}>
              <option value="">Select</option>
              {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>

            <label>Height (cm) *</label>
            <input name="height" value={profileData.height} onChange={handleChange} />

            <label>Weight (kg) *</label>
            <input name="weight" value={profileData.weight} onChange={handleChange} />

            <label>Allergies *</label>
            <input name="allergies" value={profileData.allergies} onChange={handleChange} />
          </div>
        )}

        {role === "doctor" && (
          <div className="form-section">
            <h3>Professional Info</h3>
            <label>Specialization</label>
            <input name="specialization" value={profileData.specialization} onChange={handleChange} />

            <label>License Number</label>
            <input name="license_number" value={profileData.license_number} onChange={handleChange} />
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
