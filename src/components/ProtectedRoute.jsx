import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default ProtectedRoute;