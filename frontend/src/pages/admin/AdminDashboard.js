import React, { useEffect, useState, useContext } from "react";
import "../styles/AdminDashboard.css";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
  const { userRole, loading } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/summary`, {
          credentials: "include"
        });
        const data = await res.json();
        if (res.ok) setSummary(data);
        else console.error(data.message);
      } catch (err) {
        console.error("Error fetching admin summary:", err);
      }
    };

    if (userRole === "admin" && !loading) fetchSummary();
  }, [userRole, loading]);

  if (loading) return <div>Loading...</div>;
  if (userRole !== "admin") return <div>Unauthorized</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {summary ? (
        <div className="summary-cards">
          <div className="card"><h3>Total Users</h3><p>{summary.totalUsers}</p></div>
          <div className="card"><h3>Patients</h3><p>{summary.totalPatients}</p></div>
          <div className="card"><h3>Doctors</h3><p>{summary.totalDoctors}</p></div>
        </div>
      ) : (
        <p>No data to display.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
