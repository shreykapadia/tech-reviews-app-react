// src/components/Header.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import Link, useNavigate, and useLocation
import { AuthContext } from '../contexts/AuthContext'; // Adjust path as necessary
import PropTypes from 'prop-types';
import ThemeToggle from '../components/common/ThemeToggle';

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
      className={`transition-all duration-300 ease-in-out origin-center ${isOpen ? 'rotate-45' : 'translate-y-[-6.125px]'
        }`}
      d="M3.75 12h16.5" // Defined at the vertical center
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      // Path 2: Forms middle hamburger line OR fades out for X.
      // Stays at y=12. Fades and shrinks horizontally when open.
      className={`transition-all duration-300 ease-in-out origin-center ${isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
        }`}
      d="M3.75 12h16.5" // Defined at the vertical center
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      // Path 3: Forms bottom hamburger line OR second leg of X.
      // When not open, this path is translated DOWN to become the bottom hamburger line.
      // When open, it's at its natural y=12 position and rotates.
      className={`transition-all duration-300 ease-in-out origin-center ${isOpen ? '-rotate-45' : 'translate-y-[6.125px]'
        }`}
      d="M3.75 12h16.5" // Defined at the vertical center
    />
  </svg>
);

const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
  const { user, userProfile, signOut, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

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
    const baseClass = isMobile ? "block py-2 text-center" : "block py-2";
    const hoverClass = "hover:text-brand-primary transition-colors duration-200";

    if (authLoading) {
      return <li className={`${baseClass} text-gray-500`}>Loading...</li>;
    }
    if (user) {
      return (
        <>
          {userProfile?.is_admin && (
            <li><Link to="/admin" className={`${baseClass} ${hoverClass}`} onClick={closeMobileNavAndSearch}>Admin</Link></li>
          )}
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
        <li><Link to="/login" state={{ from: location }} className={`${baseClass} ${hoverClass}`} onClick={closeMobileNavAndSearch}>Login</Link></li>
        <li><Link to="/signup" state={{ from: location }} className={`${baseClass} ${hoverClass} ${isMobile ? '' : 'px-4 py-2 bg-brand-primary text-white rounded-full hover:bg-brand-primary-dark hover:text-white shadow-md shadow-brand-primary/25'}`} onClick={closeMobileNavAndSearch}>Sign Up</Link></li>
      </>
    );
  };
  // Determine if the header should be transparent
  // Transparent only if on homepage, not scrolled, and no menus/mobile search are open
  const showTransparentHeader = isHomePage && !isScrolled && !isMenuOpen && !isMobileSearchOpen;

  // Text color for logo and hamburger icon (contrasts with background)
  const primaryInteractiveColorClass = showTransparentHeader ? 'text-white' : 'text-brand-primary';
  // Text color for navigation links (contrasts with background)
  const navLinkColorClass = showTransparentHeader ? 'text-white/90' : 'text-brand-text';
  // Search input style based on background
  const desktopSearchInputClasses = `
    w-full py-3 px-4 pr-10 text-sm rounded-full border transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
    ${showTransparentHeader
      ? 'border-white/40 bg-white/20 text-white placeholder-white/75 focus:bg-white focus:text-brand-text shadow-lg backdrop-blur-sm'
      : 'border-slate-200 bg-white text-brand-text placeholder-slate-400 focus:bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:bg-slate-700'
    }
  `;
  const desktopSearchButtonClasses = `
    absolute right-0 top-0 h-full flex items-center justify-center px-3 transition-colors duration-300
    ${showTransparentHeader ? 'text-white hover:text-brand-accent' : 'text-brand-primary hover:text-brand-accent dark:text-slate-300 dark:hover:text-brand-accent'}
  `;

  return (
    <header
      ref={headerRef}
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ease-in-out ${showTransparentHeader ? 'bg-transparent' : 'bg-white/85 dark:bg-slate-900/90 shadow-[0_10px_35px_rgba(9,40,70,0.12)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)] border-b border-white/50 dark:border-slate-700/50'
        }`}
    >
      {/* Added `relative` for positioning animated children */}
      <div className="container mx-auto relative px-4 h-16 md:h-20">

        {/* --- DEFAULT HEADER UI --- */}
        {/* This view is visible by default, but hidden on mobile when search is active */}
        <div
          className={`flex items-center justify-between w-full h-full transition-opacity duration-200 md:opacity-100 ${isMobileSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {/* Logo */}
          <Link to="/" className="cursor-pointer p-2 -m-2" onClick={closeMobileNavAndSearch}>
            <h1 className={`text-3xl font-extrabold transform hover:scale-105 transition-transform duration-200 font-serif ${showTransparentHeader ? 'text-white' : 'text-brand-primary'}`}>
              TechScore
            </h1>
          </Link>



          {/* Desktop Search Bar (Centrally Aligned) */}
          <div className="hidden md:flex flex-1 mx-4 lg:mx-8 justify-center items-center">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-lg relative">
              <input
                type="search"
                name="search_query_field"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search products, categories..."
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
            {/* Theme Toggle (Mobile) */}
            <div className="md:hidden">
              <ThemeToggle className={primaryInteractiveColorClass} />
            </div>

            {/* Mobile Search Toggle Button */}
            <button
              onClick={handleToggleMobileSearch}
              aria-label="Open search bar"
              className={`md:hidden p-3 -m-3 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${primaryInteractiveColorClass}`}
            >
              <SearchIcon />
            </button>

            {/* Hamburger Button (Mobile Only) */}
            <div className="md:hidden">
              <button
                onClick={handleToggleMenu}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                className={`p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${primaryInteractiveColorClass}`}>
                <AnimatedMenuIcon isOpen={isMenuOpen} />
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className={`flex flex-row space-x-6 lg:space-x-8 text-lg font-medium items-center ${navLinkColorClass}`}>
                <li><Link to="/tech-finder" className="block py-2 hover:text-brand-accent transition-colors duration-200" onClick={closeMobileNavAndSearch}>Tech Finder</Link></li>
                <li><Link to="/categories" className="block py-2 hover:text-brand-accent transition-colors duration-200" onClick={closeMobileNavAndSearch}>Categories</Link></li>
                <div className={`h-6 border-l mx-2 self-center ${showTransparentHeader ? 'border-white/50' : 'border-slate-300 dark:border-slate-600'}`}></div>
                {authNavLinks(false)}
                <li><ThemeToggle /></li>
              </ul>
            </nav>
          </div>
        </div>
        {/* --- MOBILE SEARCH OVERLAY --- */}
        {/* This view is hidden by default and overlays the header on mobile when search is active */}
        <div className={`absolute inset-0 w-full h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center px-2 sm:px-4 transition-opacity duration-300 ease-in-out md:hidden ${isMobileSearchOpen ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
          <form onSubmit={handleSearchSubmit} className="w-full flex items-center gap-x-2">
            <button
              type="button"
              onClick={handleToggleMobileSearch}
              className="p-2 text-gray-600 dark:text-slate-400 hover:text-brand-primary dark:hover:text-slate-200"
              aria-label="Close search bar"
            >
              <BackArrowIcon />
            </button>
            <div className="relative flex-grow">
              <input
                ref={mobileSearchInputRef}
                type="search"
                name="mobile_search_query"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search products, reviews..."
                className="w-full py-2 pl-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full focus:border-brand-primary focus:ring-brand-primary text-brand-text dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                aria-label="Search input for mobile"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-slate-400 hover:text-brand-primary"
                  aria-label="Clear search input"
                >
                  <XMarkIcon />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-full hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary shadow-md shadow-brand-primary/25"
              aria-label="Submit search"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Navigation Dropdown (only if menu is open AND mobile search is NOT active) */}
      {/* 
        This nav is always in the DOM for mobile, its visibility and animation are controlled by classes.
        - `origin-top`: Ensures scaling happens from the top edge.
        - `transition-all duration-300 ease-in-out`: Smoothly animates opacity and transform (scale).
      */}
      <nav
        className={`md:hidden absolute top-full left-0 right-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-[0_16px_34px_rgba(7,33,58,0.16)] dark:shadow-[0_16px_34px_rgba(0,0,0,0.4)] py-3 transition-all duration-300 ease-in-out origin-top ${isMenuOpen && !isMobileSearchOpen
            ? 'opacity-100 scale-y-100' // Open state: visible and full height
            : 'opacity-0 scale-y-0 pointer-events-none' // Closed state: invisible, zero height, not interactive
          }`}
      >
        <ul className="flex flex-col px-4 space-y-4 text-brand-text dark:text-slate-200 text-lg font-medium items-center">
          <li><Link to="/tech-finder" className="block py-2 hover:text-brand-accent transition-colors duration-200" onClick={closeMobileNavAndSearch}>Tech Finder</Link></li>
          <li><Link to="/categories" className="block py-2 hover:text-brand-accent transition-colors duration-200" onClick={closeMobileNavAndSearch}>Categories</Link></li>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
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
