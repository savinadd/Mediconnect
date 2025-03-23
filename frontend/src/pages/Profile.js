import React from "react";
import "../styles/Profile.css";
import { Link } from "react-router-dom";
import profilePic from "../assets/defaultImage.jpg"; 

const Profile = () => {
    return (
        <div className="profile-container">

            <div className="profile-header">
                <img src={profilePic} alt="Profile" className="profile-image" />
                <div className="profile-info">
                    <h2>John Anderson</h2>
                    <p className="patient-id">Patient ID: MED-2025-1234</p>
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
                    <p><strong>Full Name:</strong> John Anderson</p>
                    <p><strong>Date of Birth:</strong> March 15, 1985</p>
                    <p><strong>Email:</strong> john.anderson@email.com</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p><strong>Address:</strong> 123 Medical Drive, Healthcare City, HC 12345</p>
                </div>

                <div className="card">
                    <h3>Medical Information</h3>
                    <p><strong>Blood Type:</strong> A+</p>
                    <p><strong>Height:</strong> 5'10" (178 cm)</p>
                    <p><strong>Weight:</strong> 165 lbs (75 kg)</p>
                    <p><strong>Allergies:</strong></p>
                    <div className="tags">
                        <span className="tag">Penicillin</span>
                        <span className="tag">Peanuts</span>
                    </div>
                </div>

                <div className="card">
                    <h3>Recent Activity</h3>
                    <ul className="activity-list">
                        <li><span className="dot blue" /> Updated medication schedule <span className="timestamp">2 hours ago</span></li>
                        <li><span className="dot purple" /> Chat with Dr. Smith <span className="timestamp">Yesterday</span></li>
                        <li><span className="dot green" /> Logged new symptoms <span className="timestamp">2 days ago</span></li>
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
