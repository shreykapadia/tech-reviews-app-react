// src/components/common/ThemeToggle.jsx
import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`relative p-2 rounded-full transition-all duration-300 ease-in-out
        hover:bg-brand-primary/10 dark:hover:bg-white/10
        focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-white/50
        ${className}`}
        >
            {/* Sun icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-5 h-5 transition-all duration-300 ${isDark
                        ? 'rotate-0 scale-100 opacity-100'
                        : 'rotate-90 scale-0 opacity-0 absolute'
                    }`}
            >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>

            {/* Moon icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-5 h-5 transition-all duration-300 ${isDark
                        ? '-rotate-90 scale-0 opacity-0 absolute'
                        : 'rotate-0 scale-100 opacity-100'
                    }`}
            >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
        </button>
    );
}

export default ThemeToggle;
