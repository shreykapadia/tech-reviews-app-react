// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Effect for scroll detection to change header background
  useEffect(() => {
    const handleScroll = () => {
      // Change background after scrolling a bit (e.g., 20px)
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check scroll position on initial load
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect for closing menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Determine header style based on scroll and menu state
  const hasSolidBackground = isScrolled || isMenuOpen;
  // Text color for logo and hamburger icon (contrasts with background)
  const primaryInteractiveColorClass = hasSolidBackground ? 'text-brand-primary' : 'text-white';
  // Text color for navigation links (contrasts with background)
  const navLinkColorClass = hasSolidBackground ? 'text-brand-text' : 'text-white';

  return (
    <header
      ref={headerRef}
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ease-in-out py-4 ${
        hasSolidBackground ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <h1 className={`text-3xl font-extrabold transform hover:scale-105 transition-transform duration-200 cursor-pointer font-serif ${primaryInteractiveColorClass}`}>
          TechScore
        </h1>

        {/* Hamburger Button - visible on mobile, hidden on md and up */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            className={`p-1 rounded focus:outline-none ${primaryInteractiveColorClass}`}
          >
            {isMenuOpen ? (
              // Close (X) icon
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className={`absolute md:relative top-full md:top-auto left-0 md:left-auto right-0 md:right-auto w-full md:w-auto transition-all duration-300 ease-in-out origin-top ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-95 opacity-0 pointer-events-none'} md:scale-y-100 md:opacity-100 md:pointer-events-auto ${isMenuOpen ? 'bg-white shadow-lg md:shadow-none py-3' : ''} md:bg-transparent`}>
          <ul className={`flex flex-col md:flex-row md:space-x-6 lg:space-x-8 text-lg font-medium items-center ${isMenuOpen ? 'px-4 space-y-4 text-brand-text' : navLinkColorClass}`}>
            <li><a href="#" className="block py-2 md:py-0 hover:text-brand-primary transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Home</a></li>
            <li><a href="#" className="block py-2 md:py-0 hover:text-brand-primary transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Products</a></li>
            <li><a href="#" className="block py-2 md:py-0 hover:text-brand-primary transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>About</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
export default Header;