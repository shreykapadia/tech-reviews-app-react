// src/components/ProductPage/AudienceRatingDisplay.jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; // StarIcon and StarIconSolid imports removed
import { UserGroupIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; // Outline to match HowItWorks & CriticsScore

const AudienceRatingDisplay = ({ audienceRatingString, audienceReviewCount }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);

  let scoreOutOf100 = null;

  if (audienceRatingString) {
    const match = audienceRatingString.match(/(\d+(\.\d+)?)\s*\/\s*(\d+)/);
    if (match) {
      const score = parseFloat(match[1]);
      const scale = parseInt(match[3], 10);
      if (scale !== 0) {
        scoreOutOf100 = Math.round((score / scale) * 100);
      }
    }
  }

  const scoreToDisplay100 = scoreOutOf100 !== null ? scoreOutOf100 : '--';
  // const reviewCountDisplay = audienceReviewCount > 0 ? `(${audienceReviewCount.toLocaleString()} reviews)` : ''; // Removed

  // Consistent score color function
  const getScoreColor = (score, defaultColorClass = 'text-brand-secondary') => {
    if (score === null || score === '--') return defaultColorClass;
    const numericScore = Number(score);
    if (isNaN(numericScore)) return defaultColorClass;
    if (numericScore >= 85) return 'text-green-600';
    if (numericScore >= 70) return 'text-yellow-600';
    if (numericScore < 70 && numericScore >=0) return 'text-red-600';
    return defaultColorClass;
  };
  const scoreColorClass = getScoreColor(scoreToDisplay100, 'text-brand-secondary');

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
        <UserGroupIcon className="h-9 w-9 sm:h-10 sm:w-10 text-brand-secondary mr-3 sm:mr-4 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className={`text-3xl sm:text-4xl font-bold ${scoreColorClass} leading-tight`}>
            {scoreToDisplay100}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">Audience Rating</p>
          {/* The div below previously held the review count, now it's empty or can be removed if no other baseline items are planned */}
          <div className="flex items-baseline mt-0.5">
          </div>
        </div>
      </div>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsTooltipVisible(prev => !prev)}
          aria-label="More information about Audience Rating"
          aria-expanded={isTooltipVisible}
          aria-controls="audience-rating-tooltip"
          className="p-1 rounded-full text-gray-500 hover:text-brand-secondary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 transition-colors"
        >
          <InformationCircleIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
        {isTooltipVisible && (
          <div
            id="audience-rating-tooltip"
            ref={tooltipRef}
            role="tooltip"
            className="absolute right-0 mt-2 w-60 sm:w-72 p-3 bg-gray-700 text-white text-xs rounded-md shadow-xl z-30 transition-opacity duration-150 ease-in-out opacity-100"
          >
            <p className="mb-2 leading-relaxed">
              Aggregated from user reviews on TechScore and major e-commerce sites. Robust outlier handling is implemented to ensure authenticity.
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

AudienceRatingDisplay.propTypes = {
  audienceRatingString: PropTypes.string, // e.g., "4.7/5"
  audienceReviewCount: PropTypes.number,
};

AudienceRatingDisplay.defaultProps = {
  audienceRatingString: null,
  audienceReviewCount: 0,
};

export default AudienceRatingDisplay;