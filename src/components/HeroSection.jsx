// src/components/HeroSection.jsx
import React from 'react';

// Submit Arrow Icon SVG
const SubmitArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

function HeroSection() {
  const handleEmailSubmit = (event) => {
    event.preventDefault();
    // TODO: Implement actual email signup logic
    const formData = new FormData(event.target);
    const email = formData.get('email');
    alert(`Email submitted: ${email}\n(Email signup functionality to be implemented)`);
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

        {/* Email Signup Form */}
        <form onSubmit={handleEmailSubmit} className="max-w-xl mx-auto animate-fade-in delay-100">
          <div className="relative flex items-center">
            <input
              type="email"
              name="email"
              placeholder="Sign up for updates"
              // Increased pr-12 or pr-14 to make space for the button
              className="w-full p-4 pr-14 text-base rounded-full border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-md text-gray-700 placeholder-gray-400"
              aria-label="Email for updates"
            />
            <button
              type="submit"
              aria-label="Sign up for updates"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <SubmitArrowIcon />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default HeroSection;