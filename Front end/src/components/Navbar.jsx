import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'My Trips', path: '/my-trips' },
    { name: 'Community', path: '/community' },
  ];

  return (
    <header className="bg-white shadow-sm px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <h1 
          onClick={() => navigate('/home')}
          className="text-2xl font-bold text-purple-600 cursor-pointer"
        >
          GlobalTrotter
        </h1>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Profile Icon */}
        <div 
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-gray-200 cursor-pointer 
                     flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          {/* User Icon SVG */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-600"
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-600 hover:text-purple-600">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 6h16M4 12h16M4 18h16" 
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navbar;