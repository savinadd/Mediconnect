import React, { useEffect, useState } from "react";
import "../styles/EditProfile.css";

const EditProfile = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    dob: "",
    email: "",
    phone: "",
    address: "",
    bloodType: "",
    height: "",
    weight: "",
    allergies: ""
  });


  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setProfileData({
            name: `${data.first_name} ${data.last_name}`,
            dob: data.birth_date ? data.birth_date.split("T")[0] : "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            bloodType: data.blood_type || "",
            height: data.height || "",
            weight: data.weight || "",
            allergies: data.allergies || ""
          });
        } else {
          console.error("Error fetching profile:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Profile saved successfully!");
        setTimeout(() => {
          window.location.href = "/profile";
        }, 1000);
      } else {
        alert(data.message || "Error saving profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Server error. Try again later.");
    }
  };
  
  

  return (
    <div className="edit-profile-container">
      <h1>Edit Profile</h1>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="image-section">
        
         
        </div>

        <div className="form-section">
          <h3>Personal Information</h3>
          <label>Full Name</label>
          <input name="name" value={profileData.name} onChange={handleChange} />

          <label>Date of Birth</label>
          <input name="dob" type="date" value={profileData.dob} onChange={handleChange} />

          <label>Email</label>
          <input name="email" type="email" value={profileData.email} onChange={handleChange} readOnly />

          <label>Phone</label>
          <input name="phone" value={profileData.phone} onChange={handleChange} />

          <label>Address</label>
          <input name="address" value={profileData.address} onChange={handleChange} />
        </div>

        <div className="form-section">
          <h3>Medical Information</h3>
          <label>Blood Type</label>
          <input name="bloodType" value={profileData.bloodType} onChange={handleChange} />

          <label>Height (cm)</label>
          <input name="height" value={profileData.height} onChange={handleChange} />

          <label>Weight (kg)</label>
          <input name="weight" value={profileData.weight} onChange={handleChange} />

          <label>Allergies (comma-separated)</label>
          <input name="allergies" value={profileData.allergies} onChange={handleChange} />
        </div>

        <div className="form-buttons">
          <button type="submit" className="save-btn">Save Profile</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
