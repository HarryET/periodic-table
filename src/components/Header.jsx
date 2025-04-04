import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ searchTerm, onSearchChange }) => {
  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link 
            to="/" 
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            Periodic Table Explorer
          </Link>
          
          {onSearchChange && (
            <div className="w-full md:w-1/3 mt-4 md:mt-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search elements by name, symbol, or number..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 