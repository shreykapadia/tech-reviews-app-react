// src/utils/analytics.js



import { supabase } from '../services/supabaseClient';
import { withTimeout } from './asyncHelpers';

/**
 * Generates or retrieves a session ID.
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Tracks a custom event in Supabase.
 * @param {string} eventName - The name of the event.
 * @param {object} properties - Additional properties for the event.
 */
export const trackEvent = async (eventName, properties = {}) => {
  try {
    const { data: { session } } = await withTimeout(supabase.auth.getSession(), 5000);
    const userId = session?.user?.id || null;

    const eventData = {
      event_name: eventName,
      path: window.location.pathname,
      properties: properties,
      user_id: userId,
      session_id: getSessionId(),
    };

    const { error } = await supabase.from('analytics_events').insert(eventData);
    if (error) throw error;
  } catch (err) {
    console.error('Error tracking event:', err);
  }
};

/**
 * Initializes custom analytics tracking.
 */
export const initGA = () => {
  // Page View Tracking is handled via trackPageView in App.jsx

  // 1. Scroll Tracking (90%)
  let scrolledTo90 = false;
  window.addEventListener('scroll', () => {
    if (scrolledTo90) return;
    const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
    if (scrollPercent >= 0.9) {
      scrolledTo90 = true;
      trackEvent('scroll_90');
    }
  });

  // 2. Outbound Link Tracking & File Downloads
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const url = new URL(link.href);
    const isExternal = url.hostname !== window.location.hostname;

    if (isExternal) {
      trackEvent('outbound_click', { url: link.href });
    }

    const fileExtensions = ['pdf', 'zip', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const extension = url.pathname.split('.').pop().toLowerCase();
    if (fileExtensions.includes(extension)) {
      trackEvent('file_download', { url: link.href, extension });
    }
  });

  console.log("Custom Analytics Initialized.");
};

/**
 * Tracks a page view event.
 * @param {string} path - The URL path to track.
 */
export const trackPageView = (path) => {
  trackEvent('page_view', { path });
};
