// src/components/HeroSection.jsx
import React from 'react';

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
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-brand-text drop-shadow-lg animate-fade-in-up font-serif">
          <span className="block">Unbox Tomorrow, Today.</span>
          <span className="block text-brand-primary mt-2">Your Definitive Tech Insights.</span>
        </h2>
        <p className="text-xl md:text-2xl text-brand-text mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-in">
          From cutting-edge gadgets to essential software, TechScore provides unbiased, in-depth reviews and comparisons. Make smarter choices with us.
        </p>

        {/* Email Signup Form */}
        <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row justify-center items-center gap-3 animate-fade-in delay-100"> {/* Adjusted delay */}
          <input
            type="email"
            name="email"
            placeholder="email@example.com"
            className="w-full max-w-xs sm:max-w-sm md:w-96 p-3 pr-10 text-base rounded-full border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-md text-gray-700 placeholder-gray-400"
            aria-label="Email for updates"
          />
          <button
            type="submit"
            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-base font-semibold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Sign up for updates
          </button>
        </form>
      </div>
    </section>
  );
}

export default HeroSection;