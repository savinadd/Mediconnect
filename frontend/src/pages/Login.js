import React from "react";
import "../styles/Login.css"; // Import CSS file

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome to MediConnect</h2>
        <p>Connect with your healthcare professionals effortlessly</p>

        <form>
          <input type="text" placeholder="Username" className="input-field" />
          <input type="password" placeholder="Password" className="input-field" />
          <button type="submit" className="login-button">Log In</button>
        </form>

        <div className="login-links">
          <a href="#">Forgot Password?</a>
          <a href="#">Terms of Service</a>
        </div>

        <button className="register-button">Register New Account</button>
      </div>
    </div>
  );
};

export default Login;
