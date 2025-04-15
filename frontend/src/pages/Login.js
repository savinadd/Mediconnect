import React, { useState, useContext } from "react";
import "../styles/Login.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user.id, data.user.role);
        navigate("/profile");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
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
        <div className="login-links"><a href="#">Forgot Password?</a></div>
        <a href="/register" className="register-button">Register New Account</a>
      </div>
    </div>
  );
};

export default Login;
