// src/features/techFinder/components/QuestionnaireNavigation.jsx
import React from 'react';
import PropTypes from 'prop-types';

const QuestionnaireNavigation = ({
  onPrevious,
  onNext,
  isPreviousDisabled,
  isNextDisabled,
  nextButtonText = 'Next',
}) => {
  return (
    <div className="mt-8 flex justify-between items-center">
      <button
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        className="px-6 py-3 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors disabled:opacity-50"
      >
        Previous
      </button>
      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
      >
        {nextButtonText}
      </button>
    </div>
  );
};

QuestionnaireNavigation.propTypes = {
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  isPreviousDisabled: PropTypes.bool,
  isNextDisabled: PropTypes.bool,
  nextButtonText: PropTypes.string,
};

export default QuestionnaireNavigation;