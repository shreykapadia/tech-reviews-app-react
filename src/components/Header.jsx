// src/components/Header.jsx
import React from 'react';

function Header() {
  return (
    <header className="fixed w-full top-0 left-0 z-50 p-4 transition-all duration-300 ease-in-out">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <h1 className="text-3xl font-extrabold text-brand-primary mb-4 md:mb-0 transform hover:scale-105 transition-transform duration-200 cursor-pointer font-serif">TechScore</h1>
        <nav>
          <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8 text-lg font-medium text-brand-text">
            <li><a href="#" className="hover:text-brand-primary transition-colors duration-200">Home</a></li>
            <li><a href="#" className="hover:text-brand-primary transition-colors duration-200">Products</a></li>
            <li><a href="#" className="hover:text-brand-primary transition-colors duration-200">About</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;