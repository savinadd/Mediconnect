import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}
  >
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404 — Page Not Found</h1>
    <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
      Sorry, the page you’re looking for doesn’t exist.
    </p>
    <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
      Go back home
    </Link>
  </div>
);

export default NotFound;
