import React, { useState } from "react";
import "../styles/EditProfile.css";
import defaultImage from "../assets/defaultImage.jpg";

const EditProfile = () => {
  const [profileData, setProfileData] = useState({
    name: "John Anderson",
    dob: "1985-03-15",
    email: "john.anderson@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Medical Drive, Healthcare City, HC 12345",
    bloodType: "A+",
    height: "178",
    weight: "75",
    allergies: "Penicillin, Peanuts"
  });

  const [imagePreview, setImagePreview] = useState(defaultImage);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted data:", profileData);
    console.log("Uploaded image:", imageFile);
    alert("Profile saved (mock only - backend not connected)");
  };

  return (
    <div className="edit-profile-container">
      <h1>Edit Profile</h1>

      <form className="edit-profile-form" onSubmit={handleSubmit}>
        {/* Image Section */}
        <div className="image-section">
          <img src={imagePreview} alt="Profile" className="edit-profile-pic" />
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Personal Info */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <label>Full Name</label>
          <input name="name" value={profileData.name} onChange={handleChange} />

          <label>Date of Birth</label>
          <input name="dob" type="date" value={profileData.dob} onChange={handleChange} />

          <label>Email</label>
          <input name="email" type="email" value={profileData.email} onChange={handleChange} />

          <label>Phone</label>
          <input name="phone" value={profileData.phone} onChange={handleChange} />

          <label>Address</label>
          <input name="address" value={profileData.address} onChange={handleChange} />
        </div>

        {/* Medical Info */}
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
