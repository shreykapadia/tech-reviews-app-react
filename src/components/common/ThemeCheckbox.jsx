import React from 'react';
import PropTypes from 'prop-types';

const ThemeCheckbox = ({ label, checked, onChange, disabled }) => {
    return (
        <label className={`group flex items-center space-x-3 cursor-pointer select-none transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    disabled={disabled}
                />
                {/* Checkbox Box */}
                <div className={`
          w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center
          ${checked
                        ? 'bg-brand-primary border-brand-primary shadow-sm shadow-brand-primary/20'
                        : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-500 group-hover:border-brand-primary/50'}
          peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary/30 peer-focus-visible:ring-offset-1
        `}>
                    {/* Checkmark icon */}
                    <svg
                        className={`w-3.5 h-3.5 text-white transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            <span className={`text-sm font-medium transition-colors duration-200 ${checked ? 'text-brand-text dark:text-slate-100' : 'text-gray-600 dark:text-slate-400 group-hover:text-brand-primary'}`}>
                {label}
            </span>
        </label>
    );
};

ThemeCheckbox.propTypes = {
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default ThemeCheckbox;
