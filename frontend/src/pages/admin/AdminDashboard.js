import React, { useEffect, useState } from "react";
import "../../styles/AdminDashboard.css";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAdmins: 0
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminSummary();
    fetchDoctors();
    fetchPatients();
    fetchAdmins();
  }, []);

  const fetchAdminSummary = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/summary`, { credentials: "include" });
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Error fetching admin summary:", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/doctors`, { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDoctors(data);
      } else {
        console.error("Fetched doctors data is not an array:", data);
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/patients`, { credentials: "include" });
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/admins`, { credentials: "include" });
      const data = await res.json();
      setAdmins(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    console.log("Attempting to delete user with ID:", selectedUser.id); 
  
    if (!selectedUser) return;
  
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/delete/${selectedUser.id}`, {
        method: "DELETE",
        credentials: "include"
      });
  
      if (res.ok) {
        alert("User deleted successfully!");
        fetchDoctors();
        fetchPatients();
        fetchAdmins();
        fetchAdminSummary(); 
        closeModal();
      } else {
        console.error("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Users</h3>
          <p>{summary.totalUsers}</p>
        </div>
        <div className="summary-card">
          <h3>Total Doctors</h3>
          <p>{summary.totalDoctors}</p>
        </div>
        <div className="summary-card">
          <h3>Total Patients</h3>
          <p>{summary.totalPatients}</p>
        </div>
        <div className="summary-card">
          <h3>Total Admins</h3>
          <p>{summary.totalAdmins}</p>
        </div>
      </div>

      <section>
        <h2>Doctors</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <tr key={doctor.id} onClick={() => openModal(doctor)}>
                  <td>{doctor.id}</td>
                  <td>{doctor.email}</td>
                  <td>{new Date(doctor.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No doctors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Patients</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.id} onClick={() => openModal(patient)}>
                  <td>{patient.id}</td>
                  <td>{patient.email}</td>
                  <td>{new Date(patient.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Admins</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {admins.length > 0 ? (
              admins.map((admin) => (
                <tr key={admin.id} onClick={() => openModal(admin)}>
                  <td>{admin.id}</td>
                  <td>{admin.email}</td>
                  <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No admins found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {modalVisible && selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete {selectedUser.email}?</h3>
            <button className="delete-button" onClick={handleDelete}>Delete User</button>
            <button className="cancel-button" onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
