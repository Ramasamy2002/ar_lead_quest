import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Database, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className={`flex items-center ${
                location.pathname === '/dashboard'
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database className="h-5 w-5 mr-1" />
              Dashboard
            </Link>
            <Link
              to="/email"
              className={`flex items-center ${
                location.pathname === '/email'
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="h-5 w-5 mr-1" />
              Email
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 mr-1" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;