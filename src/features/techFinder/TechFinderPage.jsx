// src/features/techFinder/TechFinderPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

function TechFinderPage() {
  return (
    <>
      <Helmet>
        <title>Tech Finder - Find Your Perfect Tech</title>
        <meta name="description" content="Answer a few questions to find the ideal tech device for your needs." />
      </Helmet>
      <main className="container mx-auto px-4 py-8 mt-16 md:mt-20"> {/* Adjust mt for header */}
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-text text-center mt-12 sm:mt-20 mb-10 font-serif">
          Find Your Perfect Tech
        </h1>
        <p className="text-lg text-gray-700 text-center">
          Answer a few questions, and we'll help you discover the ideal device for your needs!
        </p>
        {/* Future content for the tech finder questionnaire will go here */}
      </main>
    </>
  );
}

export default TechFinderPage;