import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark-800 border-t border-dark-700 py-6 mt-12 text-center text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4">
        &copy; {new Date().getFullYear()} SafePath AI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
