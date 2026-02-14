// src/components/common/CookieConsentBanner.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function CookieConsentBanner({ onAccept, onDecline }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 md:p-6 lg:p-8 flex justify-center items-end pointer-events-none">
      <div className="w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8 animate-fade-in-up pointer-events-auto">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1 flex items-center justify-center md:justify-start gap-2">
            Cookie Consent
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            We use cookies to enhance your experience, analyze site traffic, and bundle relevant content. By clicking "Accept All", you consent to our use of cookies. Learn more in our <Link to="/cookie-settings" className="text-brand-primary dark:text-brand-accent hover:underline font-medium">Settings</Link>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={onDecline}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="w-full sm:w-auto px-8 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary-dark rounded-full shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;