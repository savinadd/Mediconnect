import React, { useState } from "react";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validateForm = () => {
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

    if (!email) {
      validationErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      validationErrors.email = "Invalid email format.";
    }

    if (!password) {
      validationErrors.password = "Password is required.";
    } else if (!pwRegex.test(password)) {
      validationErrors.password =
        "Password must be at least 6 characters and include letters, numbers, and a special character.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, role }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        navigate("/setup-profile");
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Error registering user:", err);
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Create an Account</h2>
        <p>Join MediConnect today</p>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <select
            className="input-field"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="login-button">
            Register
          </button>
        </form>

        <div className="login-links">
          <a href="/login">Already have an account? Log in</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
