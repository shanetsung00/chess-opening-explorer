// components/AuthModal.js
import React, { useState } from 'react';
import { signIn, signUp } from '../utils/authUtils';

const AuthModal = ({ onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      onSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-header">
          <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="auth-switch">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="switch-btn"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="auth-benefits">
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