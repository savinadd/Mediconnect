import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const { isLoggedIn, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-logo">
                    <img src={logo} alt="MediConnect Logo" className="logo-img" />
                    <span>MediConnect</span>
                </div>

                {/* Navigation Links */}
                <ul className="nav-links">
                    {isLoggedIn ? (
                        <>
                            <li><Link to="/symptoms">Symptoms</Link></li>
                            <li><Link to="/prescriptions">Medications</Link></li>
                            <li><Link to="/profile">Profile</Link></li>
                            <li><button
                                onClick={() => {
                                    logout();
                                    navigate("/");
                                }}
                                className="logout-btn"
                            >
                                Logout
                            </button></li>

                        </>
                    ) : (
                        <>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About</Link></li>
                        </>
                    )}
                </ul>

                {/* Sign Up Button */}
                {!isLoggedIn && <Link to="/register" className="signup-button">Sign Up</Link>}
            </div>
        </nav>
    );
};

export default Navbar;
