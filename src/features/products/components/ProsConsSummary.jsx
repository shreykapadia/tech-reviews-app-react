// src/components/ProductPage/ProsConsSummary.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ProsConsSummaryComponent = ({ aiProsCons }) => {
  if (!aiProsCons || (!aiProsCons.pros?.length && !aiProsCons.cons?.length)) {
    return null; // Don't render if no pros or cons
  }

  const { pros = [], cons = [] } = aiProsCons;
  const ListItem = ({ children, type }) => {
    const IconComponent = type === 'pro' ? CheckCircleIcon : XCircleIcon;
    const iconColor = type === 'pro' ? 'text-green-600' : 'text-red-600';

    return (
      <li className="flex items-start mb-2">
        <IconComponent className={`h-5 w-5 ${iconColor} mr-2.5 mt-0.5 flex-shrink-0`} aria-hidden="true" />
        <span className="text-sm text-brand-text leading-relaxed">{children}</span>
      </li>
    );
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200 animate-fade-in-up">
      <h3 className="text-lg sm:text-xl font-semibold text-brand-text font-sans mb-4">
        Pros & Cons at a Glance
      </h3>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
        {pros.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-2">Pros</h4>
            <ul className="space-y-1">
              {pros.map((pro, index) => (
                <ListItem key={`pro-${index}`} type="pro">{pro}</ListItem>
              ))}
            </ul>
          </div>
        )}

        {cons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-700 mb-2">Cons</h4>
            <ul className="space-y-1">
              {cons.map((con, index) => (
                <ListItem key={`con-${index}`} type="con">{con}</ListItem>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500 italic text-right">
        AI-generated summary
      </p>
    </div>
  );
};

ProsConsSummaryComponent.propTypes = {
  aiProsCons: PropTypes.shape({
    pros: PropTypes.arrayOf(PropTypes.string),
    cons: PropTypes.arrayOf(PropTypes.string),
  }),
};

ProsConsSummaryComponent.defaultProps = {
  aiProsCons: { pros: [], cons: [] },
};

const ProsConsSummary = React.memo(ProsConsSummaryComponent);
ProsConsSummary.displayName = 'ProsConsSummary';
export default ProsConsSummary;