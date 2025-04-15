import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, userRole: role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
    <div className="navbar-container">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="MediConnect Logo" className="logo-img" />
        <span>MediConnect</span>
      </Link>
  
      <div className="nav-right">
        <ul className="nav-links">
          {isLoggedIn ? (
            <>
              {role === "patient" && (
                <>
                  <li><Link to="/symptoms">Symptoms</Link></li>
                  <li><Link to="/chat">Chat</Link></li>
                </>
              )}
              {role === "doctor" && (
                <>
                  <li><Link to="/doctor-chat">Chat</Link></li>
                </>
              )}
              {(role === "patient" || role === "doctor") && (
                <li><Link to="/prescriptions">Medications</Link></li>
              )}
              {role === "admin" && (
                <li><Link to="/admin">Admin</Link></li>
              )}
              <li><Link to="/profile">Profile</Link></li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="logout-btn"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li>
                <Link to="/register" className="signup-button">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  </nav>
  
  );
};

export default Navbar;
