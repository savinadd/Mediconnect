import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Symptoms from "./pages/Symptoms";
import Prescriptions from "./pages/Prescription";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SetupProfile from "./pages/SetupProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatTest from "./pages/Chat";
import DoctorChat from "./pages/DoctorChat";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { Toaster } from "react-hot-toast";
const AppRoutes = () => {


  return (
    <>
   <Toaster
  toastOptions={{
    className: '',
    style: {
      border: '2px solid black',
      padding: '16px',
      fontSize: '20px'
    },
  }}
/>
       <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/symptoms" element={<ProtectedRoute><Symptoms /></ProtectedRoute>} />
        <Route path="/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/setup-profile" element={<SetupProfile />} />
        <Route path="/chat" element={<ProtectedRoute><ChatTest /></ProtectedRoute>} />
        <Route path="/doctor-chat" element={<ProtectedRoute><DoctorChat /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
