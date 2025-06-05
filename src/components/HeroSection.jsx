// src/components/HeroSection.jsx
import React from 'react';

function HeroSection() {
  return (
    <section className="hero-bg-image relative flex items-center justify-center min-h-screen py-24 text-center overflow-hidden">
      <div className="absolute inset-0 bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-brand-text drop-shadow-lg animate-fade-in-up font-serif">
          <span className="block">Unbox Tomorrow, Today.</span>
          <span className="block text-brand-primary mt-2">Your Definitive Tech Insights.</span>
        </h2>
        <p className="text-xl md:text-2xl text-brand-text mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-in">
          From cutting-edge gadgets to essential software, TechScore provides unbiased, in-depth reviews and comparisons. Make smarter choices with us.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in delay-200">
          <input
            type="email"
            placeholder="email@example.com"
            className="w-full sm:w-96 p-4 pr-12 text-lg rounded-full border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 shadow-md text-gray-700 placeholder-gray-400"
          />
          <button
            className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Sign up for updates
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;