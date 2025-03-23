import React, { useState } from "react";
import "../styles/Login.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // from AuthProvider


  const handleLogin = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("token", data.token);
        login(); // mark as logged in globally
        navigate("/symptoms"); // go to Symptoms page
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome to MediConnect!</h2>
        <p>Connect with healthcare professionals, track symptoms and medications, and more.</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button">Log In</button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="login-links">
          <a href="#">Forgot Password?</a>
        </div>

        <button className="register-button">Register New Account</button>
      </div>
    </div>
  );
};

export default Login;
