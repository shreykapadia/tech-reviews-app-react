// src/components/Header.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { AuthContext } from '../contexts/AuthContext'; // Adjust path as necessary
import PropTypes from 'prop-types';

// --- Icon Components ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const AnimatedMenuIcon = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-7 h-7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      // Path 1: Forms top hamburger line OR first leg of X.
      // All paths are defined as if they are the middle bar (d="M3.75 12h16.5").
      // When not open, this path is translated UP to become the top hamburger line.
      // When open, it's at its natural y=12 position and rotates.
      className={`transition-all duration-300 ease-in-out origin-center ${
        isOpen ? 'rotate-45' : 'translate-y-[-6.125px]'
      }`}
      d="M3.75 12h16.5" // Defined at the vertical center
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      // Path 2: Forms middle hamburger line OR fades out for X.
      // Stays at y=12. Fades and shrinks horizontally when open.
      className={`transition-all duration-300 ease-in-out origin-center ${
        isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
      }`}
      d="M3.75 12h16.5" // Defined at the vertical center
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      // Path 3: Forms bottom hamburger line OR second leg of X.
      // When not open, this path is translated DOWN to become the bottom hamburger line.
      // When open, it's at its natural y=12 position and rotates.
      className={`transition-all duration-300 ease-in-out origin-center ${
        isOpen ? '-rotate-45' : 'translate-y-[6.125px]'
      }`}
      d="M3.75 12h16.5" // Defined at the vertical center
    />
  </svg>
);

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

function Header({ onSearchSubmit, isHomePage = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const headerRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const { user, signOut, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/'); // Redirect to homepage after logout
      if (isMenuOpen) setIsMenuOpen(false); // Close mobile menu if open
    } catch (error) {
      console.error("Failed to sign out:", error);
      // Optionally, display an error message to the user
    }
  };

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

  // Effect for closing menu or mobile search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        if (isMenuOpen) setIsMenuOpen(false);
        if (isMobileSearchOpen) setIsMobileSearchOpen(false);
      }
    };
    if (isMenuOpen || isMobileSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isMobileSearchOpen]);

  // Effect for focusing mobile search input when it opens
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim() === '') return;

    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
    // It's good practice to clear the search query in the header and close mobile search after submission
    setSearchQuery('');
    if (isMobileSearchOpen) setIsMobileSearchOpen(false);
  };

  const handleToggleMenu = () => {
    if (isMobileSearchOpen) {
      setIsMobileSearchOpen(false); // Close search if opening menu
      setSearchQuery('');
    }
    setIsMenuOpen(prev => !prev);
  };

  const handleToggleMobileSearch = () => {
    setIsMobileSearchOpen(prev => {
      const openingSearch = !prev;
      if (openingSearch) {
        setIsMenuOpen(false); // Close menu if opening search
      } else {
        setSearchQuery(''); // Clear search query when closing
      }
      return openingSearch;
    });
  };

  const closeMobileNavAndSearch = () => {
    setIsMenuOpen(false);
    // setIsMobileSearchOpen(false); // Not needed here as links are in menu
  }

  const authNavLinks = (isMobile = false) => {
    const baseClass = isMobile ? "block py-2 text-center" : "block py-2"; // Adjusted for mobile centering
    const hoverClass = "hover:text-brand-primary transition-colors duration-200";

    if (authLoading) {
      return <li className={`${baseClass} text-gray-500`}>Loading...</li>;
    }
    if (user) {
      return (
        <>
          <li><Link to="/dashboard" className={`${baseClass} ${hoverClass}`} onClick={closeMobileNavAndSearch}>Favorites</Link></li>
          <li>
            <button onClick={handleLogout} className={`${baseClass} ${hoverClass} text-red-600 hover:text-red-700 w-full text-center md:text-left`}>
              Logout
            </button>
          </li>
        </>
      );
    }
    return (
      <>
        <li><Link to="/login" className={`${baseClass} ${hoverClass}`} onClick={closeMobileNavAndSearch}>Login</Link></li>
        <li><Link to="/signup" className={`${baseClass} ${hoverClass} ${isMobile ? '' : 'px-3 py-1.5 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark hover:text-white'}`} onClick={closeMobileNavAndSearch}>Sign Up</Link></li>
      </>
    );
  };
  // Determine if the header should be transparent
  // Transparent only if on homepage, not scrolled, and no menus/mobile search are open
  const showTransparentHeader = isHomePage && !isScrolled && !isMenuOpen && !isMobileSearchOpen;

  // Text color for logo and hamburger icon (contrasts with background)
  const primaryInteractiveColorClass = showTransparentHeader ? 'text-gray-700' : 'text-brand-primary';
  // Text color for navigation links (contrasts with background)
  const navLinkColorClass = showTransparentHeader ? 'text-gray-700' : 'text-brand-text';
  // Search input style based on background
  const desktopSearchInputClasses = `
    w-full py-3 px-4 pr-10 text-sm rounded-full border-2 transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
    ${showTransparentHeader // When header is transparent, search bar still looks solid
      ? 'border-gray-300 bg-gray-50 text-brand-text placeholder-gray-500 focus:bg-white shadow-md' // Styles for solid look
      : 'border-gray-300 bg-gray-50 text-brand-text placeholder-gray-500 focus:bg-white' // Styles for solid state (already solid)
    }
  `;
  const desktopSearchButtonClasses = `
    absolute right-0 top-0 h-full flex items-center justify-center px-3 transition-colors duration-300
    ${showTransparentHeader ? 'text-brand-primary hover:text-brand-accent' : 'text-brand-primary hover:text-brand-accent'}
  `;

  return (
    <header
      ref={headerRef}
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ease-in-out ${
        showTransparentHeader ? 'bg-transparent' : 'bg-white shadow-lg'
      }`}
    >
      {/* Added `relative` for positioning animated children */}
      <div className="container mx-auto relative flex items-center justify-between px-4 h-16 md:h-20"> {/* Removed overflow-hidden for simplicity with inline search */}
 
        {/* --- DEFAULT HEADER UI --- */}
        {/* This block now always stays, and the mobile search input is injected into it */}
        <div
          className="flex items-center justify-between w-full h-full"
        >
            {/* Logo */}
            <Link to="/" className="cursor-pointer p-2 -m-2" onClick={closeMobileNavAndSearch}>
              <h1 className={`text-3xl font-extrabold transform hover:scale-105 transition-transform duration-200 font-serif text-brand-primary`}>
                TechScore
              </h1>
            </Link>

            {/* Conditionally Rendered Mobile Search Input Form */}
            <form
                id="mobileHeaderSearchForm"
                onSubmit={handleSearchSubmit}
                // md:hidden ensures it's only for mobile.
                // flex-grow allows it to take available space.
                // mx-2 for spacing.
                // transition-all for smooth width/opacity changes.
                className={`md:hidden flex-grow mx-2 transition-all duration-300 ease-in-out ${
                    isMobileSearchOpen ? 'max-w-full opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
                }`}
            >
                <input
                    ref={mobileSearchInputRef}
                    type="search"
                    name="mobile_search_query"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="Search..."
                    className="w-full py-2 bg-transparent border-0 border-b-2 border-gray-300 focus:border-brand-primary focus:outline-none focus:ring-0 text-brand-text placeholder-gray-500"
                    aria-label="Search input for mobile"
                />
            </form>

            {/* Desktop Search Bar (Centrally Aligned) */}
            <div className="hidden md:flex flex-1 mx-4 lg:mx-8 justify-center items-center">
              <form onSubmit={handleSearchSubmit} className="w-full max-w-lg relative">
                <input
                  type="search"
                  name="search_query_field"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search products, reviews..."
                  className={desktopSearchInputClasses}
                  aria-label="Search"
                />
                <button type="submit" className={desktopSearchButtonClasses} aria-label="Submit search">
                  <SearchIcon />
                </button>
              </form>
            </div>

            {/* Right-Side Controls: Mobile Search Icon, Hamburger, Desktop Nav */}
            {/* Added flex-shrink-0 to prevent this group from shrinking */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              {/* Mobile Search Toggle/Submit Button */}
              <button
                // If search is open, this button acts as submit for the form.
                // If search is closed, it toggles the search open.
                onClick={!isMobileSearchOpen ? handleToggleMobileSearch : undefined}
                type={isMobileSearchOpen ? "submit" : "button"}
                form={isMobileSearchOpen ? "mobileHeaderSearchForm" : undefined}
                aria-label={isMobileSearchOpen ? "Submit search query" : "Open search bar"}
                className={`md:hidden p-3 rounded-full hover:bg-gray-100/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${primaryInteractiveColorClass}`}
              >
                <SearchIcon />
              </button>

              {/* Hamburger Button (Mobile Only) */}
              <div className="md:hidden">
                <button
                  onClick={handleToggleMenu}
                  aria-label="Toggle menu"
                  aria-expanded={isMenuOpen}
                  className={`p-2 rounded-full hover:bg-gray-100/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${primaryInteractiveColorClass}`}>
                  <AnimatedMenuIcon isOpen={isMenuOpen} />
                </button>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:block">
                 <ul className={`flex flex-row space-x-6 lg:space-x-8 text-lg font-medium items-center ${navLinkColorClass}`}>
                    <li><Link to="/tech-finder" className="block py-2 hover:text-brand-primary transition-colors duration-200" onClick={closeMobileNavAndSearch}>Tech Finder</Link></li>
                    <li><Link to="/categories" className="block py-2 hover:text-brand-primary transition-colors duration-200" onClick={closeMobileNavAndSearch}>Categories</Link></li>
                    <div className="h-6 border-l border-gray-300 mx-2 self-center"></div> {/* Separator */}
                    {authNavLinks(false)}
                 </ul>
              </nav>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown (only if menu is open AND mobile search is NOT active) */}
      {/* 
        This nav is always in the DOM for mobile, its visibility and animation are controlled by classes.
        - `origin-top`: Ensures scaling happens from the top edge.
        - `transition-all duration-300 ease-in-out`: Smoothly animates opacity and transform (scale).
      */}
      <nav
        className={`md:hidden absolute top-full left-0 right-0 w-full bg-white shadow-lg py-3 transition-all duration-300 ease-in-out origin-top ${
          isMenuOpen && !isMobileSearchOpen
            ? 'opacity-100 scale-y-100' // Open state: visible and full height
            : 'opacity-0 scale-y-0 pointer-events-none' // Closed state: invisible, zero height, not interactive
        }`}
      >
          <ul className="flex flex-col px-4 space-y-4 text-brand-text text-lg font-medium items-center">
            <li><Link to="/tech-finder" className="block py-2 hover:text-brand-primary transition-colors duration-200" onClick={closeMobileNavAndSearch}>Tech Finder</Link></li>
            <li><Link to="/categories" className="block py-2 hover:text-brand-primary transition-colors duration-200" onClick={closeMobileNavAndSearch}>Categories</Link></li>
            <hr className="my-2 border-gray-200"/>
            {authNavLinks(true)}
          </ul>
      </nav>
    </header>
  );
}

Header.propTypes = {
  onSearchSubmit: PropTypes.func.isRequired,
  isHomePage: PropTypes.bool,
};

Header.defaultProps = {
  isHomePage: false,
};

export default Header;