import React, { useEffect, useState } from "react";
import "../styles/Profile.css";
import { Link } from "react-router-dom";
import defaultImage from "../assets/defaultImage.jpg";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setProfileData(data);
        } else {
          console.error("Error fetching profile:", data.message);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchProfile();
  }, []);

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
          <span className="active-badge">Active Patient</span>
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
          <p><strong>Date of Birth:</strong> {birth_date}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone:</strong> {phone}</p>
          <p><strong>Address:</strong> {address}</p>
        </div>

        <div className="card">
          <h3>Medical Information</h3>
          <p><strong>Blood Type:</strong> {blood_type}</p>
          <p><strong>Height:</strong> {height} cm</p>
          <p><strong>Weight:</strong> {weight} kg</p>
          <p><strong>Allergies:</strong></p>
          <div className="tags">
            {allergies?.split(",").map((tag, index) => (
              <span className="tag" key={index}>{tag.trim()}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            <li><span className="dot blue" /> Updated profile info <span className="timestamp">Just now</span></li>
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
