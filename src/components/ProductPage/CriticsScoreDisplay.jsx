// src/components/ProductPage/CriticsScoreDisplay.jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; // Using outline to match HowItWorksSection

const CriticsScoreDisplay = ({ criticsScore }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);

  const scoreToDisplay = criticsScore !== null && criticsScore !== undefined ? Math.round(criticsScore) : '--';

  // Consistent score color function
  const getScoreColor = (score, defaultColorClass = 'text-brand-primary') => {
    if (score === null || score === '--') return defaultColorClass;
    const numericScore = Number(score);
    if (isNaN(numericScore)) return defaultColorClass;

    if (numericScore >= 85) return 'text-green-600';
    if (numericScore >= 70) return 'text-yellow-600';
    if (numericScore < 70 && numericScore >=0) return 'text-red-600';
    return defaultColorClass;
  };
  const scoreColorClass = getScoreColor(scoreToDisplay, 'text-brand-primary');

  // Handle clicks outside of the tooltip to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsTooltipVisible(false);
      }
    };

    if (isTooltipVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTooltipVisible]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md flex items-center justify-between relative border border-gray-200 animate-fade-in-up">
      <div className="flex items-center">
        <ShieldCheckIcon className="h-9 w-9 sm:h-10 sm:w-10 text-brand-primary mr-3 sm:mr-4 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className={`text-3xl sm:text-4xl font-bold ${scoreColorClass} leading-tight`}>
            {scoreToDisplay}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">Critics Score</p>
        </div>
      </div>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsTooltipVisible(prev => !prev)}
          aria-label="More information about Critics Score"
          aria-expanded={isTooltipVisible}
          aria-controls="critics-score-tooltip"
          className="p-1 rounded-full text-gray-500 hover:text-brand-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors"
        >
          <InformationCircleIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
        {isTooltipVisible && (
          <div
            id="critics-score-tooltip"
            ref={tooltipRef}
            role="tooltip"
            className="absolute right-0 mt-2 w-60 sm:w-72 p-3 bg-gray-700 text-white text-xs rounded-md shadow-xl z-30 transition-opacity duration-150 ease-in-out opacity-100"
          >
            <p className="mb-2 leading-relaxed">
              Aggregated from professional tech reviewers and reputable tech YouTubers using a weighted average model, normalized to a 0-100 scale.
            </p>
            <Link to="/about-methodology" className="font-semibold text-blue-300 hover:text-blue-200 underline focus:outline-none focus:ring-1 focus:ring-blue-300 rounded">
              Learn More
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

CriticsScoreDisplay.propTypes = {
  criticsScore: PropTypes.number,
};

CriticsScoreDisplay.defaultProps = {
  criticsScore: null,
};

export default CriticsScoreDisplay;