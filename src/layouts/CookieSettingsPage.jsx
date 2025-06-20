
// src/features/staticContent/CookieSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';

// Helper components for consistent styling
const SectionTitle = ({ children }) => (
  <h2 className="text-2xl font-semibold text-brand-text mt-8 mb-4">{children}</h2>
);

const Paragraph = ({ children }) => (
  <p className="text-brand-text mb-4 leading-relaxed text-base">{children}</p>
);

const ToggleSwitch = ({ id, label, checked, onChange, disabled }) => (
  <label htmlFor={id} className={`flex items-center justify-between py-4 border-b border-gray-200 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
    <span className={`font-medium text-lg ${disabled ? 'text-gray-400' : 'text-brand-text'}`}>{label}</span>
    <div className="relative">
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className={`block w-14 h-8 rounded-full ${disabled ? 'bg-gray-200' : (checked ? 'bg-brand-primary' : 'bg-gray-300')}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
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
        // Handle new granular consent object
        const parsedConsent = JSON.parse(consentCookie);
        if (typeof parsedConsent === 'object' && parsedConsent !== null) {
          setPreferences({
            analytics: !!parsedConsent.analytics,
            marketing: !!parsedConsent.marketing,
          });
        }
      } catch (e) {
        // Handle old "accepted" / "declined" string values for backward compatibility
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
    // Store preferences as a JSON string for granular control
    Cookies.set('userConsent', JSON.stringify(preferences), { expires: 365, path: '/' });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
  };

  const handleAcceptAll = () => {
    const newPrefs = { analytics: true, marketing: true };
    setPreferences(newPrefs);
    // Store preferences as a JSON string for granular control and consistency
    Cookies.set('userConsent', JSON.stringify(newPrefs), { expires: 365, path: '/' });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-brand-light-gray min-h-screen py-8 pt-20 md:pt-24">
      <div className="container mx-auto px-4">
        <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 max-w-4xl mx-auto">
          <header className="mb-8 border-b pb-6 border-gray-200">
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary font-serif mb-3">
              Cookie Settings
            </h1>
            <Paragraph>
              We use cookies to enhance your experience. You can customize your preferences below. For more details, please see our{' '}
              <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</Link>.
            </Paragraph>
          </header>

          <section className="space-y-6">
            <div>
              <SectionTitle>Manage Consent Preferences</SectionTitle>
              <div className="space-y-2">
                <ToggleSwitch
                  id="essential-cookies"
                  label="Strictly Necessary Cookies"
                  checked={true}
                  disabled={true}
                />
                <Paragraph>
                  These cookies are essential for the website to function and cannot be disabled. They are typically set in response to your actions, such as logging in or filling out forms.
                </Paragraph>
              </div>
            </div>

            <div>
              <ToggleSwitch
                id="analytics-cookies"
                label="Analytics Cookies"
                checked={preferences.analytics}
                onChange={() => handleToggle('analytics')}
              />
              <Paragraph>
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This allows us to measure and improve site performance.
              </Paragraph>
            </div>

            <div>
              <ToggleSwitch
                id="marketing-cookies"
                label="Marketing Cookies"
                checked={preferences.marketing}
                onChange={() => handleToggle('marketing')}
              />
              <Paragraph>
                These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user, and thereby more valuable for publishers and third party advertisers.
              </Paragraph>
            </div>
          </section>

          <footer className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-4">
            {isSaved && <p className="text-green-600 font-semibold mr-auto">Preferences Saved!</p>}
            <button
              onClick={handleSavePreferences}
              className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
            >
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto bg-brand-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
            >
              Accept All
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default CookieSettingsPage;