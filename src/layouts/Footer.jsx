// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-slate-200/70 bg-slate-950 text-slate-200 py-12 sm:py-14">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brand-accent/25 blur-3xl"></div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-x-6 sm:gap-x-8 gap-y-2 text-sm sm:text-base">
            <li><Link to="/" className="hover:text-brand-accent transition-colors duration-200">Home</Link></li>
            <li><a href="/#products" className="hover:text-brand-accent transition-colors duration-200">Products</a></li>
            <li><a href="/#about" className="hover:text-brand-accent transition-colors duration-200">About Us</a></li>
            <li><Link to="/privacy-policy" className="hover:text-brand-accent transition-colors duration-200">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-brand-accent transition-colors duration-200">Terms of Service</Link></li>
            <li><Link to="/cookie-settings" className="hover:text-brand-accent transition-colors duration-200">Cookie Settings</Link></li>
          </ul>
        </nav>
        <p className="text-sm text-slate-300 leading-normal">
          &copy; {currentYear} TechScore. All rights reserved.
        </p>
        <p className="text-xs text-slate-400 mt-3 leading-normal max-w-3xl mx-auto">
          Disclaimer: All reviews and opinions are based on our team's expertise and research. Product specifications and availability are subject to change.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
