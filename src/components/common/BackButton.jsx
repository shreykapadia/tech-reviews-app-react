import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

/**
 * A consistent, reusable BackButton component.
 * @param {string} [to] - Optional path to navigate to. If not provided, goes back in history.
 * @param {string} [className] - Optional additional CSS classes.
 * @param {string} [label] - Optional label (defaults to "Back").
 */
const BackButton = ({ to, className = '', label = 'Back' }) => {
    const navigate = useNavigate();

    const handleBack = (e) => {
        if (to) return; // Link handle this
        e.preventDefault();
        navigate(-1);
    };

    const buttonContent = (
        <>
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            {label && <span className="font-medium">{label}</span>}
        </>
    );

    const baseClasses = `inline-flex items-center p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 hover:text-brand-primary transition-all duration-200 shadow-sm border border-gray-200 dark:border-slate-700 group ${className}`;

    if (to) {
        return (
            <a
                href={to}
                onClick={(e) => {
                    e.preventDefault();
                    navigate(to);
                }}
                className={baseClasses}
                aria-label={label || 'Go back'}
            >
                {buttonContent}
            </a>
        );
    }

    return (
        <button
            onClick={handleBack}
            className={baseClasses}
            aria-label={label || 'Go back'}
        >
            {buttonContent}
        </button>
    );
};

BackButton.propTypes = {
    to: PropTypes.string,
    className: PropTypes.string,
    label: PropTypes.string,
};

export default BackButton;
