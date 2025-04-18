import React from "react";
import "../styles/Home.css";
import doctorAppImage from "../assets/homepage.jpg";
import { useNavigate } from "react-router-dom";

const HealthPriority = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-text">
        <h1>Your Health, Our Priority</h1>
        <p>
          Easily connect with certified doctors, track your symptoms,
          and manage prescriptions—all in one secure platform.
        </p>
        <div className="buttons">
          <button className="primary-btn" onClick={() => navigate("/register")}>
            Get Started
          </button>
          <button className="secondary-btn" onClick={() => navigate("/login")}>
            I Already Have an Account
          </button>
        </div>
      </div>

      <div className="home-image">
        <img src={doctorAppImage} alt="Doctor illustration" />
      </div>
    </div>
  );
};

export default HealthPriority;
