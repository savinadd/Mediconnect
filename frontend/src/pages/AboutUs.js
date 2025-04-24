import React from 'react';
import '../styles/AboutUs.css';
import doctorImage from "../assets/doctor.jpg";
import { MdDashboard, MdAutorenew, MdSecurity } from 'react-icons/md';

export default function AboutUs() {
  return (
    <section className="about-wrapper">
      <div className="about-glow top-left" />
      <div className="about-glow bottom-right" />

      <div className="about-container">
        <h2 className="about-title">Practical tools for modern healthcare</h2>
        <p className="about-subtitle">
          MediConnect is a simple, reliable platform that helps doctors and patients stay connected and allows patients to monitor key information about their health.
        </p>

        <div className="about-row">
          <div className="about-image">
            <img src={doctorImage} alt="Doctor illustration" />
          </div>
          <div className="about-text">
            <p>
              MediConnect focuses on the everyday needs of patients and healthcare providers. From booking appointments to checking prescriptions and managing care, the platform is built to reduce friction and save time.
            </p>
            <p>
              We aim to support informed decisions and better communication by keeping essential tools all in one place.
            </p>
          </div>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <h3><MdDashboard size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Unified Access</h3>
            <p>Appointments, prescriptions, and messaging—available from a single dashboard.</p>
          </div>
          <div className="about-card">
            <h3><MdAutorenew size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Continuous Improvement</h3>
            <p>We welcome feedback and are open to change. Let us know how we can improve.</p>
            <p>Reach out at <a href="mailto:sdd210@aubg.edu">sdd210@aubg.edu</a> with suggestions or questions.</p>
          </div>
          <div className="about-card">
            <h3><MdSecurity size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Respect for Privacy</h3>
            <p>We take data protection seriously. Your medical information stays secure and confidential.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
