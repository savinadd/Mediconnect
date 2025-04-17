import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, userRole: role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="MediConnect Logo" className="logo-img" />
          <span>MediConnect</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className={`nav-right ${menuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            {isLoggedIn ? (
              <>
                {role === "patient" && (
                  <>
                    <li><Link to="/symptoms" onClick={() => setMenuOpen(false)}>Symptoms</Link></li>
                    <li><Link to="/chat" onClick={() => setMenuOpen(false)}>Chat</Link></li>
                  </>
                )}
                {role === "doctor" && (
                  <li><Link to="/doctor-chat" onClick={() => setMenuOpen(false)}>Chat</Link></li>
                )}
                {(role === "patient" || role === "doctor") && (
                  <li><Link to="/prescriptions" onClick={() => setMenuOpen(false)}>Prescriptions</Link></li>
                )}
                {role === "admin" && (
                  <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link></li>
                )}
                <li><Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
                <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
                <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
                <li><Link to="/register" className="signup-button" onClick={() => setMenuOpen(false)}>Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
