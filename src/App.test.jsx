import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cookies from 'js-cookie';
import App from './App'; // We test the App component which includes AppContent

// --- Mocks ---

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(), // Though not used in App.jsx directly for consent, good to have
}));

// Mock react-router-dom hooks used in AppContent
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Import and retain default behavior
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// Mock CookieConsentBanner to make it easier to find and interact with
jest.mock('./components/common/CookieConsentBanner', () => {
  return jest.fn(({ onAccept, onDecline }) => (
    <div data-testid="cookie-banner">
      <button data-testid="accept-cookies" onClick={onAccept}>Accept Cookies</button>
      <button data-testid="decline-cookies" onClick={onDecline}>Decline Cookies</button>
      <a href="/privacy-policy">Privacy Policy</a>
      <a href="/terms-of-service">Terms of Service</a>
    </div>
  ));
});

// Mock supabase client
jest.mock('./services/supabaseClient.js', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: [], error: null }), // Default mock for any table
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  },
}));

// Mock global fetch for JSON files
global.fetch = jest.fn((url) => {
  if (url.includes('criticWeights.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ /* mock critic weights data if needed */ }),
    });
  }
  if (url.includes('searchAliases.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ /* mock search aliases data if needed */ }),
    });
  }
  return Promise.resolve({ ok: false, status: 404 });
});

// Mock child components that are not the focus of these tests to simplify rendering
jest.mock('./layouts/Header', () => jest.fn(() => <header data-testid="header">Header</header>));
jest.mock('./layouts/Footer', () => jest.fn(() => <footer data-testid="footer">Footer</footer>));
jest.mock('./routes/AppRoutes', () => jest.fn(() => <div data-testid="app-routes">App Routes</div>));


describe('App Cookie Consent Functionality', () => {
  beforeEach(() => {
    // Reset mocks before each test
    Cookies.get.mockReset();
    Cookies.set.mockReset();
    mockNavigate.mockReset();
    mockUseLocation.mockReturnValue({ pathname: '/', search: '', hash: '', state: null });
    global.fetch.mockClear();
    // Ensure supabase mock is reset if it becomes stateful in tests
    jest.clearAllMocks(); // Clears all mocks, including supabase and fetch call counts

    // Default mock for fetch to avoid unhandled promise rejections if not specifically overridden
    global.fetch.mockImplementation((url) => {
        if (url.includes('criticWeights.json')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        if (url.includes('searchAliases.json')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        }
        // For supabase calls, if fetch is used by the library (it's not by default for js client)
        return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
    });
  });

  test('shows cookie banner if no consent cookie is present', async () => {
    Cookies.get.mockReturnValue(undefined); // No cookie set
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('cookie-banner')).toBeInTheDocument();
    });
    expect(Cookies.get).toHaveBeenCalledWith('userConsent');
  });

  test('does not show cookie banner if consent cookie is "accepted"', async () => {
    Cookies.get.mockReturnValue('accepted');
    render(<App />);
    // Wait for initial data loading to complete to ensure all useEffects have run
    await screen.findByTestId('app-routes'); // Wait for a stable part of the app to render
    
    expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument();
    expect(Cookies.get).toHaveBeenCalledWith('userConsent');
  });

  test('does not show cookie banner if consent cookie is "declined"', async () => {
    Cookies.get.mockReturnValue('declined');
    render(<App />);
    await screen.findByTestId('app-routes');

    expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument();
    expect(Cookies.get).toHaveBeenCalledWith('userConsent');
  });

  test('sets "accepted" cookie and hides banner when accept is clicked', async () => {
    Cookies.get.mockReturnValue(undefined); // Ensure banner is shown initially
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('cookie-banner')).toBeInTheDocument();
    });

    const acceptButton = screen.getByTestId('accept-cookies');
    fireEvent.click(acceptButton);

    expect(Cookies.set).toHaveBeenCalledWith('userConsent', JSON.stringify({ analytics: true, marketing: true }), { expires: 365, path: '/' });
    await waitFor(() => {
        expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument();
    });
  });

  test('sets "declined" cookie and hides banner when decline is clicked', async () => {
    Cookies.get.mockReturnValue(undefined); // Ensure banner is shown initially
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('cookie-banner')).toBeInTheDocument();
    });

    const declineButton = screen.getByTestId('decline-cookies');
    fireEvent.click(declineButton);

    expect(Cookies.set).toHaveBeenCalledWith('userConsent', JSON.stringify({ analytics: false, marketing: false }), { expires: 365, path: '/' });
    await waitFor(() => {
        expect(screen.queryByTestId('cookie-banner')).not.toBeInTheDocument();
    });
  });

  test('logs to console when analytics is enabled', async () => {
    Cookies.get.mockReturnValue(JSON.stringify({ analytics: true, marketing: true }));
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<App />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Analytics enabled. Initializing analytics scripts...');
    });
    consoleSpy.mockRestore();
  });
});