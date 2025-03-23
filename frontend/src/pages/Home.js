import React from "react";
import "../styles/Home.css"; // Import CSS file
import doctorAppImage from "../assets/homepage.jpg"; // Ensure your image is placed in src/assets/

const HealthPriority = () => {
  return (
    <div className="home-container">
      {/* Left Section - Text & Buttons */}
      <div className="home-text">
        <h1>Your Health, Our Priority</h1>
        <p>
          Connect with medical professionals, track your health, and manage
          your medications all in one place.
        </p>
        <div className="buttons">   
          <button className="primary-btn">Get Started</button>
          <button className="secondary-btn">Learn More</button>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="home-image">
        <img src={doctorAppImage} alt="Doctor image" />
      </div>
    </div>
  );
};

export default HealthPriority;
