import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Symptoms from './pages/Symptoms';
import Prescriptions from './pages/Prescription';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import SetupProfile from './pages/SetupProfile';
import ChatTest from './pages/Chat';
import DoctorChat from './pages/DoctorChat';
import AdminDashboard from './pages/admin/AdminDashboard';
import BookAppointment from './pages/BookAppointment';
import DoctorSchedule from './pages/DoctorSchedule';
import AboutUs from './pages/AboutUs';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          toastOptions={{
            style: { border: '2px solid black', padding: '16px', fontSize: '20px' },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Patient */}
          <Route
            path="/appointments/book"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <BookAppointment />
              </ProtectedRoute>
            }
          />

          {/* Doctor */}
          <Route
            path="/appointments/schedule"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorSchedule />
              </ProtectedRoute>
            }
          />

          {/* Shared */}
          <Route
            path="/symptoms"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
                <Symptoms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor']}>
                <Prescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/setup-profile" element={<SetupProfile />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <ChatTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-chat"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
