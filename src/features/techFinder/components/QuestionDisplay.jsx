// src/features/techFinder/components/QuestionDisplay.jsx
import React from 'react';
import PropTypes from 'prop-types';

const QuestionDisplay = ({ question, currentAnswer, onAnswerSelect }) => {
  if (!question) return null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">{question.text}</h3>
      {question.type === 'radio' && (
        <div className="space-y-3">
          {question.options.map(option => (
            <label key={option.value + '-' + question.id} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={currentAnswer === option.value}
                onChange={() => onAnswerSelect(question.id, option.value)}
                className="h-5 w-5 text-brand-primary focus:ring-brand-primary border-gray-300"
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
      {question.type === 'multiselect_checkbox' && (
        <div className="space-y-3">
          {question.options.map(option => (
            <label key={option.value + '-' + question.id} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                name={question.id}
                value={option.value}
                // currentAnswer for multiselect is expected to be an array
                checked={Array.isArray(currentAnswer) && currentAnswer.includes(option.value)}
                onChange={(e) => onAnswerSelect(question.id, option.value, e.target.checked)}
                className="h-5 w-5 text-brand-primary focus:ring-brand-primary border-gray-300 rounded" // Added rounded for checkbox
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
      {/* Add other question types like 'range' here later */}
    </div>
  );
};

QuestionDisplay.propTypes = {
  question: PropTypes.object,
  // currentAnswer can now be a string or an array of strings for multiselect
  currentAnswer: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onAnswerSelect: PropTypes.func.isRequired,
};

export default QuestionDisplay;