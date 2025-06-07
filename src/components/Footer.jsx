// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 py-10 sm:py-12">
      <div className="container mx-auto px-4 text-center">
        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-x-6 sm:gap-x-8 gap-y-2 text-sm sm:text-base">
            <li><Link to="/" className="hover:text-white transition-colors duration-200">Home</Link></li>
            <li><a href="/#products" className="hover:text-white transition-colors duration-200">Products</a></li> {/* Placeholder link */}
            <li><a href="/#about" className="hover:text-white transition-colors duration-200">About Us</a></li> {/* Placeholder link */}
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
          </ul>
        </nav>
        <p className="text-sm text-gray-400">
          &copy; {currentYear} TechScore. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 mt-3">
          Disclaimer: All reviews and opinions are based on our team's expertise and research. Product specifications and availability are subject to change.
        </p>
      </div>
    </footer>
  );
}

export default Footer;