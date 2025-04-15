import React, { useEffect, useState } from "react";
import "../styles/Profile.css";
import { Link } from "react-router-dom";
import defaultImage from "../assets/defaultImage.jpg";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { userRole: role, isLoggedIn } = useContext(AuthContext);
const [profileData, setProfileData] = useState(null);
const [activities, setActivities] = useState([]);

  

useEffect(() => {
  if (!isLoggedIn) return;

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
        credentials: "include"
      });
      const data = await res.json();
      console.log("AuthContext role at render:", role);

      if (res.ok) setProfileData(data);
      else console.error("Error fetching profile:", data.message);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/activity/recent`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) setActivities(data);
      else console.error("Error fetching activity:", data.message);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  fetchProfile();
  fetchActivity();
}, [isLoggedIn]);


  if (!profileData) return <div>Loading...</div>;

  const {
    first_name,
    last_name,
    birth_date,
    email,
    phone,
    address,
    blood_type,
    height,
    weight,
    allergies,
    specialization,
    license_number,
    profile_picture
  } = profileData;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src={profile_picture ? `http://localhost:3000${profile_picture}` : defaultImage}
          alt="Profile"
          className="profile-image"
        />
        <div className="profile-info">
          <h2>{first_name} {last_name}</h2>
          <span className="active-badge">Active {role === "doctor" ? "Doctor" : "Patient"}</span>
          <div className="edit-profile-btn-container">
            <button className="edit-profile-btn">
              <Link to="/edit-profile">Edit Profile</Link>
            </button>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card">
          <h3>Personal Information</h3>
          <p><strong>Full Name:</strong> {first_name} {last_name}</p>
          {role === "patient" && (
  <p>
    <strong>Date of Birth:</strong>{" "}
    {birth_date ? new Date(birth_date).toLocaleDateString() : "N/A"}
  </p>
)}

          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone:</strong> {phone}</p>
          <p><strong>Address:</strong> {address}</p>
        </div>

        {role === "patient" && (
          <div className="card">
            <h3>Medical Information</h3>
            <p><strong>Blood Type:</strong> {blood_type || "Unknown"}</p>
            <p><strong>Height:</strong> {height} cm</p>
            <p><strong>Weight:</strong> {weight} kg</p>
            <p><strong>Allergies:</strong></p>
            <div className="tags">
              {allergies?.split(",").map((tag, index) => (
                <span className="tag" key={index}>{tag.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {role === "doctor" && (
          <div className="card">
            <h3>Professional Information</h3>
            <p><strong>Specialization:</strong> {specialization}</p>
            <p><strong>License Number:</strong> {license_number}</p>
          </div>
        )}

        <div className="card">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {activities.length > 0 ? (
              activities.map((a, i) => (
                <li key={i}>
                  <span className="dot blue" />
                  {a.description}
                  <span className="timestamp">{new Date(a.created_at).toLocaleString()}</span>
                </li>
              ))
            ) : (
              <li>No recent activity.</li>
            )}
          </ul>
        </div>
      </div>

      <footer className="profile-footer">
        <p>© 2025 MediConnect. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Support</a>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
