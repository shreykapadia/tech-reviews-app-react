// src/features/techFinder/components/TechFinderQuestionnaire.jsx
import React from 'react';
import PropTypes from 'prop-types';
import QuestionDisplay from './QuestionDisplay';
import QuestionnaireNavigation from './QuestionnaireNavigation';

const TechFinderQuestionnaire = ({
  questions,
  currentQuestionIndex,
  userAnswers,
  onAnswerSelect,
  onNavigatePrevious,
  onNavigateNext,
  categoryName,
  totalQuestions,
  allProductsForCategory, // For "No questions available" case
  calculateCriticsScore, // For "No questions available" case
  ProductCardComponent, // For "No questions available" case
  onRestart, // For "No questions available" case
}) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-4">No questions available for {categoryName}</h2>
        <p className="text-lg text-gray-700 dark:text-slate-300 mb-8">We don't have a guided questionnaire for this category yet. You can browse all {categoryName} products directly.</p>
        {allProductsForCategory && ProductCardComponent && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {allProductsForCategory.map(product => (
              <ProductCardComponent key={product.id || product.productName} product={product} calculateCriticsScore={calculateCriticsScore} />
            ))}
          </div>
        )}
        <button onClick={onRestart} className="mt-8 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-dark transition-colors">Start Over</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

  return (
    <div className="py-10">
      <p className="text-sm text-gray-500 mb-2">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
      <QuestionDisplay
        question={currentQuestion}
        currentAnswer={userAnswers[currentQuestion?.id]}
        onAnswerSelect={onAnswerSelect}
      />
      <QuestionnaireNavigation
        onPrevious={onNavigatePrevious}
        onNext={onNavigateNext}
        isPreviousDisabled={currentQuestionIndex === 0}
        isNextDisabled={currentQuestion?.type === 'radio' && !userAnswers[currentQuestion?.id] && !isLastQuestion}
        nextButtonText={isLastQuestion ? 'Show Results' : 'Next'}
      />
    </div>
  );
};

TechFinderQuestionnaire.propTypes = {
  questions: PropTypes.array.isRequired,
  currentQuestionIndex: PropTypes.number.isRequired,
  userAnswers: PropTypes.object.isRequired,
  onAnswerSelect: PropTypes.func.isRequired,
  onNavigatePrevious: PropTypes.func.isRequired,
  onNavigateNext: PropTypes.func.isRequired,
  categoryName: PropTypes.string.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  allProductsForCategory: PropTypes.array,
  calculateCriticsScore: PropTypes.func,
  ProductCardComponent: PropTypes.elementType,
  onRestart: PropTypes.func,
};

export default TechFinderQuestionnaire;