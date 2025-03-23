import React, { useState } from "react";
import "../styles/Login.css"; // Reusing the login styles

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient"); // Default role
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({}); // Store validation errors

  const validateForm = () => {
    let validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      validationErrors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      validationErrors.email = "Invalid email format.";
    }

    if (!password) {
      validationErrors.password = "Password is required.";
    } else if (password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0; // Returns true if no errors
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Prevent submission if validation fails

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);

        // Clear inputs after successful registration
        setEmail("");
        setPassword("");
        setRole("patient");
        setErrors({});
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error registering user:", error);
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
