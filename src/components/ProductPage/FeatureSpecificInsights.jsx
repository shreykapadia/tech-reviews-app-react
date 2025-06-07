// src/components/ProductPage/FeatureSpecificInsights.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { CameraIcon, Battery50Icon, ComputerDesktopIcon, CpuChipIcon, PaintBrushIcon, CogIcon } from '@heroicons/react/24/outline'; // Example icons

// Placeholder ABSA data - this would come from your backend/data source
const placeholderFeatureSentiments = [
  {
    id: 'camera',
    featureName: "Camera Quality",
    icon: CameraIcon,
    sentiment: "positive", // 'positive', 'neutral', 'negative'
    sentimentScore: 88, // 0-100, for visual bar
    summary: "Users and critics consistently praise the camera for its sharp images, excellent low-light performance, and versatile shooting modes. Video recording is also a strong point.",
  },
  {
    id: 'battery',
    featureName: "Battery Life",
    icon: Battery50Icon,
    sentiment: "positive",
    sentimentScore: 82,
    summary: "The device offers impressive battery longevity, easily lasting a full day for most users even with moderate to heavy usage. Fast charging support is a welcome addition.",
  },
  {
    id: 'display',
    featureName: "Display",
    icon: ComputerDesktopIcon,
    sentiment: "positive",
    sentimentScore: 92,
    summary: "The display is frequently highlighted for its vibrant colors, excellent brightness levels suitable for outdoor use, and smooth refresh rate enhancing user experience.",
  },
  {
    id: 'performance',
    featureName: "Performance",
    icon: CpuChipIcon,
    sentiment: "positive",
    sentimentScore: 85,
    summary: "Overall performance is snappy and responsive, handling demanding applications and multitasking with ease. Gamers will appreciate the smooth frame rates.",
  },
  {
    id: 'design',
    featureName: "Design & Build",
    icon: PaintBrushIcon,
    sentiment: "neutral",
    sentimentScore: 65,
    summary: "The design is considered modern and premium by many, though some find it iterative. Build quality is generally solid, but opinions on material choices vary.",
  },
  {
    id: 'software',
    featureName: "Software & UI",
    icon: CogIcon,
    sentiment: "neutral",
    sentimentScore: 70,
    summary: "The software offers a clean user interface and useful features. However, some users report occasional minor bugs or desire more customization options.",
  },
];

const getSentimentColor = (sentiment) => {
  if (sentiment === 'positive') return 'bg-green-500';
  if (sentiment === 'neutral') return 'bg-yellow-400';
  if (sentiment === 'negative') return 'bg-red-500';
  return 'bg-gray-300';
};

const FeatureInsightItem = ({ feature, isOpen, onToggle }) => {
  const IconComponent = feature.icon || PaintBrushIcon; // Default icon

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
          <span className="text-sm sm:text-base font-medium text-brand-text">{feature.featureName}</span>
        </div>
        <div className="flex items-center">
          <div className="w-16 sm:w-20 h-2 bg-gray-200 rounded-full overflow-hidden mr-2 sm:mr-3">
            <div
              className={`h-full rounded-full ${getSentimentColor(feature.sentiment)}`}
              style={{ width: `${feature.sentimentScore}%` }}
              title={`Sentiment: ${feature.sentimentScore}% ${feature.sentiment}`}
            />
          </div>
          {isOpen ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
        </div>
      </button>
      {isOpen && (
        <div id={`feature-details-${feature.id}`} className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-2">{feature.summary}</p>
          <p className="text-xs text-gray-500 italic">AI-generated summary</p>
        </div>
      )}
    </div>
  );
};

const FeatureSpecificInsights = ({ product }) => {
  const [openFeatureId, setOpenFeatureId] = useState(null);

  // In a real app, featureSentiments would be derived from 'product' prop or fetched
  const featureSentiments = placeholderFeatureSentiments;

  if (!product || !featureSentiments || featureSentiments.length === 0) {
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
            <FeatureInsightItem
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
  product: PropTypes.object.isRequired, // Would contain ABSA data in a real scenario
};

export default FeatureSpecificInsights;