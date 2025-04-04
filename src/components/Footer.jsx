import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white shadow-inner py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Periodic Table Explorer
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">
              Data from <a 
                href="https://github.com/Bowserinator/Periodic-Table-JSON" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Periodic-Table-JSON
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 