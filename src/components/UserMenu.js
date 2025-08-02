import React, { useState } from 'react';
import { UserIcon } from './Icons';

// A new component for the hamburger icon
const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const UserMenu = ({ user, onManageRepertoires, onSignOut, onSignIn }) => {
  // Add state to manage if the mobile menu is open
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // This function will be used to close the menu if user clicks away
  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };
  
  const handleManageClick = () => {
    onManageRepertoires();
    handleMenuClose();
  };

  const handleSignOutClick = () => {
    onSignOut();
    handleMenuClose();
  };

  return (
    <div className="user-section">
      {user ? (
        <>
          {/* Hamburger button, only visible on mobile via CSS */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle user menu"
          >
            <HamburgerIcon />
          </button>

          {/* The full menu for desktop, which becomes a dropdown on mobile */}
          <div className={`user-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <span className="user-name">{user.displayName || user.email}</span>
            <button 
              onClick={handleManageClick}
              className="repertoire-btn"
            >
              Manage Repertoires
            </button>
            <button onClick={handleSignOutClick} className="sign-out-btn">
              Sign Out
            </button>
          </div>
          
          {/* Overlay to close menu when clicking away on mobile */}
          {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={handleMenuClose}></div>}
        </>
      ) : (
        <button 
          onClick={onSignIn}
          className="sign-in-btn"
        >
          <UserIcon />
          Sign In
        </button>
      )}
    </div>
  );
};

export default UserMenu;