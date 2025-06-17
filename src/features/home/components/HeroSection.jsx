// src/components/HeroSection.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Added Link for navigation

// Wrap the component definition with React.memo.
// Using a named function expression for better debugging and component display name in React DevTools.
const HeroSection = React.memo(function HeroSection() {
  const handleEmailSubmit = (event) => {
    event.preventDefault();
    // TODO: Implement actual email signup logic
  };

  return (
    <section className="hero-bg-image relative flex items-center justify-center min-h-screen py-24 text-center overflow-hidden">
      <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm"></div>

      {/* Added px-4 for padding on smaller screens, max-w-4xl handles larger screen centering */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-brand-text drop-shadow-lg animate-fade-in-up font-serif">
          <span className="block">Unbox Tomorrow, Today.</span>
          <span className="block text-brand-primary mt-2">Your Definitive Tech Insights.</span>
        </h2>
        <p className="text-lg md:text-2xl text-brand-text mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-in">
          From cutting-edge gadgets to essential software, TechScore provides unbiased, in-depth reviews and comparisons. Make smarter choices with us.
        </p>

        {/* Tech Finder Call to Action */}
        <div className="mt-12 animate-fade-in delay-100">
          <div>
            <Link
              to="/tech-finder" // Assuming this is the route for your Tech Finder
              className="inline-block px-10 py-4 bg-brand-primary text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Find your perfect device
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;