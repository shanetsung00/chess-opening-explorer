
import React, { useState } from 'react';
import { auth } from '../utils/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import './AuthModal.css';

const AuthModal = ({ onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear any previous errors on a new attempt

    try {
      if (isLoginView) {
        // Handle Sign In
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Handle Sign Up
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose(); // Close the modal on successful login or sign-up
    } catch (err) {
      // Provide user-friendly error messages
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-login-credentials':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Please sign in.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters long.');
          break;
        default:
          setError('An unexpected error occurred. Please try again.');
          console.error("Firebase auth error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h2>{isLoginView ? 'Sign In' : 'Sign Up'}</h2>
          <button className="close-btn" onClick={onClose} title="Close">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-switch">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button className="switch-btn" onClick={() => {
            setIsLoginView(!isLoginView);
            setError(''); // Clears error when switching views
          }}>
            {isLoginView ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
        
        <div className="auth-features">
          <h3>With an account you can:</h3>
          <ul>
            <li>Create up to 10 custom repertoires</li>
            <li>Save up to 100 openings per repertoire</li>
            <li>Sync across all your devices</li>
            <li>Edit repertoire names</li>
            <li>Organize openings by theme or style</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
