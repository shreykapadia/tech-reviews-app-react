// src/components/ProductPage/FeatureSpecificInsights.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import {
  CameraIcon,
  Battery50Icon,
  ComputerDesktopIcon,
  CpuChipIcon,
  PaintBrushIcon,
  CogIcon,
  SpeakerWaveIcon, // Example for Audio
  WifiIcon,        // Example for Connectivity
  DevicePhoneMobileIcon, // Added for "Software & UI"
  BriefcaseIcon, // Added for "Portability"
  TvIcon, // Added for "Picture Quality"
  PuzzlePieceIcon, // Added for "Gaming Features"
  LinkIcon, // Added for "Connectivity & Ports"
  QuestionMarkCircleIcon, // Default/fallback icon
} from '@heroicons/react/24/outline';

// Icon mapping from feature_category (lowercase) to Heroicon component
const iconMap = {
  // Specific mappings as per request
  'camera quality': CameraIcon,
  'battery life': Battery50Icon,
  'design & build': PaintBrushIcon,
  'software & ui': DevicePhoneMobileIcon,
  'portability': BriefcaseIcon,
  'picture quality': TvIcon,
  'gaming features': PuzzlePieceIcon,
  'connectivity & ports': LinkIcon,

  // General/fallback mappings (can be kept or removed if specific ones cover all cases)
  'camera': CameraIcon, // Fallback if "Camera Quality" isn't exact
  'battery': Battery50Icon, // Fallback
  'display': ComputerDesktopIcon,
  'performance': CpuChipIcon,
  'design': PaintBrushIcon, // Fallback
  'software': DevicePhoneMobileIcon, // Fallback, or CogIcon if preferred for generic "software"
  'ui': DevicePhoneMobileIcon, // Fallback, or CogIcon if preferred for generic "ui"
  'audio': SpeakerWaveIcon,
  'connectivity': WifiIcon,
};

const getSentimentCategory = (score) => {
  // Ensure score is a number for comparison
  const numericScore = typeof score === 'string' ? parseFloat(score) : score;

  if (typeof numericScore !== 'number' || isNaN(numericScore)) return 'unknown';

  if (numericScore >= 75) return 'positive';
  if (numericScore >= 50) return 'neutral';
  if (numericScore < 50) return 'negative'; 
  return 'unknown'; 
};

const getSentimentColor = (sentiment) => {
  if (sentiment === 'positive') return 'bg-green-500';
  if (sentiment === 'neutral') return 'bg-yellow-400';
  if (sentiment === 'negative') return 'bg-red-500';
  return 'bg-gray-300';
};

const FeatureInsightItem = ({ feature, isOpen, onToggle }) => {
  // feature.feature_category should come from Supabase
  // feature.concensus_sentiment_score and feature.feature_summary as well
  console.log('[FeatureInsightItem] Processing feature:', feature); // Log individual feature

  const IconComponent = iconMap[(feature.feature_category || '').toLowerCase()] || QuestionMarkCircleIcon;
  
  // Robust score handling
  const rawScore = feature.concensus_sentiment_score;
  let numericScore = typeof rawScore === 'string' ? parseFloat(rawScore) : rawScore;
  if (typeof numericScore !== 'number' || isNaN(numericScore)) {
    numericScore = null; // Treat non-numeric/NaN as null for consistency
  }

  const sentimentCategory = getSentimentCategory(numericScore);
  const displayScore = numericScore !== null ? Math.max(0, Math.min(100, numericScore)) : 0;

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`feature-details-${feature.id}`}
        className="w-full flex items-center justify-between py-3 sm:py-4 px-1 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-100 transition-colors"
      >
        <div className="flex items-center">
          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary mr-3 flex-shrink-0" />
          <span className="text-sm sm:text-base font-medium text-brand-text">
            {feature.feature_category || 'Unnamed Feature'}
          </span>
        </div>
        <div className="flex items-center">
          {/* Display score text */}
          <span className="text-xs sm:text-sm text-gray-600 font-medium w-10 text-right mr-2">
            {numericScore !== null ? `${numericScore.toFixed(0)}%` : 'N/A'}
          </span>

          {/* Always render the bar structure */}
          {/* Adjusted width of the bar container slightly if needed, or keep as is if layout allows */}
          {/* Original: w-16 sm:w-20. If space is tight, consider w-12 sm:w-16 or adjust margins. */}
          <div className="w-14 sm:w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2 sm:mr-3">
            <div
              className={`h-full rounded-full ${getSentimentColor(sentimentCategory)}`}
              style={{ width: `${displayScore}%` }}
              title={
                numericScore !== null
                  ? `Sentiment: ${numericScore.toFixed(0)}% ${sentimentCategory}`
                  : 'Sentiment: N/A'
              }
            />
          </div>
          {isOpen ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
        </div>
      </button>
      {isOpen && (
        <div id={`feature-details-${feature.id}`} className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-2">
            {feature.feature_summary || 'No summary available for this feature.'}
          </p>
          {feature.feature_summary && ( // Only show "AI-generated" if there's a summary
            <p className="text-xs text-gray-500 italic">AI-generated summary</p>
          )}
        </div>
      )}
    </div>
  );
};

const FeatureSpecificInsights = ({ product, insightsData }) => {
  const [openFeatureId, setOpenFeatureId] = useState(null);

  // Log the received insightsData prop
  console.log('[FeatureSpecificInsights] Received insightsData:', insightsData);

  // Use insightsData prop, which comes from Supabase via ProductPage
  const featureSentiments = insightsData || [];

  // Check if product exists and if there are any feature sentiments to display
  if (!product || featureSentiments.length === 0) {
    return null;
  }

  const handleToggleFeature = (featureId) => {
    setOpenFeatureId(openFeatureId === featureId ? null : featureId);
  };

  return (
    <div className="py-8 sm:py-10 bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in-up mt-6 sm:mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-brand-primary font-serif mb-6 sm:mb-8 text-center sm:text-left">
          Feature Insights
        </h3>
        <div className="border border-gray-200 rounded-md">
          {featureSentiments.map((feature) => (
            <FeatureInsightItem // Ensure feature has a unique 'id' or use index as last resort
              key={feature.id}
              feature={feature}
              isOpen={openFeatureId === feature.id}
              onToggle={() => handleToggleFeature(feature.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

FeatureSpecificInsights.propTypes = {
  product: PropTypes.object.isRequired,
  insightsData: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Assuming 'id' is the primary key from your table
    feature_category: PropTypes.string,
    consensus_sentiment_score: PropTypes.number, // Corrected spelling: Can be null
    feature_summary: PropTypes.string,
    product_id: PropTypes.number.isRequired,
  })),
};

export default FeatureSpecificInsights;