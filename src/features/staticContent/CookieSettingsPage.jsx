// src/features/staticContent/CookieSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';

// Helper components for consistent styling
const SectionTitle = ({ children }) => (
  <h2 className="text-2xl font-bold text-brand-text mt-8 mb-4">{children}</h2>
);

const Paragraph = ({ children }) => (
  <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed text-base">{children}</p>
);

const ToggleSwitch = ({ id, label, checked, onChange, disabled }) => (
  <label htmlFor={id} className={`flex items-center justify-between py-5 border-b border-slate-200 dark:border-slate-700/50 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
    <span className={`font-semibold text-lg ${disabled ? 'text-slate-400' : 'text-brand-text'}`}>{label}</span>
    <div className="relative">
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className={`block w-14 h-8 rounded-full transition-colors ${disabled ? 'bg-slate-200 dark:bg-slate-700' : (checked ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600')}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${checked ? 'transform translate-x-6' : ''}`}></div>
    </div>
  </label>
);

function CookieSettingsPage() {
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
  });
  const [isSaved, setIsSaved] = useState(false);

  // Load preferences from cookie on component mount
  useEffect(() => {
    const consentCookie = Cookies.get('userConsent');
    if (consentCookie) {
      try {
        const parsedConsent = JSON.parse(consentCookie);
        if (typeof parsedConsent === 'object' && parsedConsent !== null) {
          setPreferences({
            analytics: !!parsedConsent.analytics,
            marketing: !!parsedConsent.marketing,
          });
        }
      } catch (e) {
        if (consentCookie === 'accepted') {
          setPreferences({ analytics: true, marketing: true });
        } else {
          setPreferences({ analytics: false, marketing: false });
        }
      }
    }
  }, []);

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    setIsSaved(false);
  };

  const handleSavePreferences = () => {
    Cookies.set('userConsent', JSON.stringify(preferences), { expires: 365, path: '/' });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    const newPrefs = { analytics: true, marketing: true };
    setPreferences(newPrefs);
    Cookies.set('userConsent', JSON.stringify(newPrefs), { expires: 365, path: '/' });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen py-12 pt-24 md:pt-32">
      <div className="container mx-auto px-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 shadow-[0_32px_120px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_120px_rgba(0,0,0,0.4)] rounded-3xl p-6 sm:p-10 md:p-14 max-w-4xl mx-auto">
          <header className="mb-10 border-b pb-8 border-slate-200 dark:border-slate-800">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-text font-serif mb-5 tracking-tight">
              Cookie Settings
            </h1>
            <Paragraph>
              We value your privacy. Customize your cookie preferences below to control how we enhance your experience. For a complete overview, read our{' '}
              <Link to="/privacy-policy" className="text-brand-primary dark:text-brand-accent hover:underline font-semibold transition-colors">Privacy Policy</Link>.
            </Paragraph>
          </header>

          <section className="space-y-8">
            <div>
              <SectionTitle>Privacy Preferences</SectionTitle>
              <div className="space-y-4">
                <div className="group">
                  <ToggleSwitch
                    id="essential-cookies"
                    label="Strictly Necessary Cookies"
                    checked={true}
                    disabled={true}
                  />
                  <div className="mt-3">
                    <Paragraph>
                      These are required for technical reasons. They allow you to navigate the site and use essential features like secure areas or product comparisons. They cannot be turned off.
                    </Paragraph>
                  </div>
                </div>

                <div className="group">
                  <ToggleSwitch
                    id="analytics-cookies"
                    label="Performance & Analytics"
                    checked={preferences.analytics}
                    onChange={() => handleToggle('analytics')}
                  />
                  <div className="mt-3">
                    <Paragraph>
                      These help us understand how you use our site. We use this data to improve loading speeds, search accuracy, and overall layout based on real user behavior.
                    </Paragraph>
                  </div>
                </div>

                <div className="group">
                  <ToggleSwitch
                    id="marketing-cookies"
                    label="Marketing & Targetting"
                    checked={preferences.marketing}
                    onChange={() => handleToggle('marketing')}
                  />
                  <div className="mt-3">
                    <Paragraph>
                      Used to deliver content more relevant to you and your interests. They may be used to limit the number of times you see an advertisement or to measure the effectiveness of a campaign.
                    </Paragraph>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              {isSaved && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold animate-fade-in">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Preferences updated successfully
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={handleSavePreferences}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-8 rounded-2xl transition-all active:scale-95"
              >
                Save Choice
              </button>
              <button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3.5 px-10 rounded-2xl shadow-xl shadow-brand-primary/20 transition-all active:scale-95"
              >
                Accept All
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default CookieSettingsPage;
