// src/utils/analytics.js

/**
 * The Google Analytics Measurement ID from environment variables.
 */
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Initializes Google Analytics by injecting the gtag.js script and configuring the tracker.
 * Only runs if GA_MEASUREMENT_ID is provided and the script isn't already present.
 */
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn("Google Analytics ID not found. Analytics will not be initialized.");
    return;
  }

  // Check if the script is already added to avoid multiple injections
  if (document.getElementById('google-analytics-script')) {
    return;
  }

  // Create the script element for gtag.js
  const script = document.createElement('script');
  script.id = 'google-analytics-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize the dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    // Disable automatic page views as we handle them manually on route changes
    send_page_view: false,
  });
};

/**
 * Tracks a page view event.
 * @param {string} path - The URL path to track (e.g., location.pathname + location.search).
 */
export const trackPageView = (path) => {
  if (window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
    });
    console.log(`Analytics: Tracked page view for ${path}`);
  }
};
