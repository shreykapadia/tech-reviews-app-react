
// src/components/CookieConsentBanner.jsx
import React from 'react';

function CookieConsentBanner({ onAccept, onDecline }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: '#f8f9fa', // A light background
      padding: '20px',
      textAlign: 'center',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      borderTop: '1px solid #dee2e6'
    }}>
      <p style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>
        We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
        {/* You should link to your cookie policy here */}
      </p>
      <button onClick={onAccept} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Accept All</button>
      <button onClick={onDecline} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>Decline</button>
    </div>
  );
}

export default CookieConsentBanner;