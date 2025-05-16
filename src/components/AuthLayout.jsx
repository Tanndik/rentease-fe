import React from 'react';
import { Link } from 'react-router-dom';

function AuthLayout({ children, title, subtitle, userType, isLogin = false }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{title}</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
          
          
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

export default AuthLayout;