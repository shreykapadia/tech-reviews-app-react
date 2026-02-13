import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { Link, useLocation } from 'react-router-dom';

const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState('general');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
    const { user } = useAuth();
    const widgetRef = useRef(null);
    const location = useLocation();

    // Close widget when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (widgetRef.current && !widgetRef.current.contains(event.target)) {
                if (isOpen) setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Reset form when opening/closing
    useEffect(() => {
        if (!isOpen) {
            setSubmitStatus(null);
            setMessage('');
            setFeedbackType('general');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const { error } = await supabase
                .from('feedback')
                .insert([
                    {
                        type: feedbackType,
                        message,
                        email: user.email,
                        user_id: user.id,
                    },
                ]);

            if (error) throw error;

            setSubmitStatus('success');
            setTimeout(() => {
                setIsOpen(false);
                setSubmitStatus(null);
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleWidget = () => setIsOpen(!isOpen);

    // Styling Classes
    const glassPanelClasses = "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]";
    const buttonStyles = "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 z-50 fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-brand-primary hover:bg-brand-primary-dark";

    return (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end pointer-events-none" ref={widgetRef}>
            {/* The widget container is pointer-events-none to let clicks pass through the huge fixed area, 
            but children need pointer-events-auto */}

            {/* Expanded Form / Auth Prompt */}
            {isOpen && (
                <div className={`pointer-events-auto mb-4 w-[90vw] max-w-sm rounded-[1.5rem] p-6 animate-fade-in-up ${glassPanelClasses}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-brand-text dark:text-white">
                            {user ? 'Send Feedback' : 'Join the Community'}
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            aria-label="Close feedback widget"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {!user ? (
                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Sign up or log in to share your thoughts, report bugs, and help us improve TechScore.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/signup"
                                    state={{ from: location }}
                                    className="w-full py-2 px-4 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-dark transition-colors shadow-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    to="/login"
                                    state={{ from: location }}
                                    className="w-full py-2 px-4 bg-white dark:bg-slate-800 text-brand-text dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Log In
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {submitStatus === 'success' ? (
                                <div className="text-center py-8 animate-fade-in">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-bold text-brand-text dark:text-white">Thank You!</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Your feedback has been received.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Type
                                        </label>
                                        <select
                                            id="feedbackType"
                                            value={feedbackType}
                                            onChange={(e) => setFeedbackType(e.target.value)}
                                            className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:ring-brand-primary focus:border-brand-primary sm:text-sm py-3 px-4 appearance-none"
                                        >
                                            <option value="general">General Feedback</option>
                                            <option value="bug">Report a Bug</option>
                                            <option value="feature">Feature Request</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="feedbackMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            id="feedbackMessage"
                                            rows={4}
                                            required
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell us what you think..."
                                            className="w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-brand-primary focus:border-brand-primary sm:text-sm resize-none p-4"
                                        />
                                    </div>

                                    {submitStatus === 'error' && (
                                        <div className="text-red-500 text-sm text-center">
                                            Something went wrong. Please try again.
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !message.trim()}
                                        className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-md text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isSubmitting ? (
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : 'Submit Feedback'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={toggleWidget}
                className={`pointer-events-auto shadow-[0_4px_14px_rgba(0,0,0,0.16)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 flex items-center justify-center w-14 h-14 rounded-full bg-brand-primary hover:bg-brand-primary-dark text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary z-50`}
                aria-label="Open feedback form"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default FeedbackWidget;
