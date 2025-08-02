// components/RepertoireSelector.js - Production Version
import React, { useState } from 'react';
import { 
  addOpeningToRepertoire, 
  removeOpeningFromRepertoire, 
  createRepertoire,
  LIMITS 
} from '../utils/authUtils';

const RepertoireSelector = ({ user, userData, opening, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRepertoireName, setNewRepertoireName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const handleToggleRepertoire = async (repertoireId, isCurrentlyIn) => {
    setLoading(true);
    setError('');
    
    try {
      if (isCurrentlyIn) {
        await removeOpeningFromRepertoire(user.uid, repertoireId, opening.uniqueId);
      } else {
        await addOpeningToRepertoire(user.uid, repertoireId, opening.uniqueId);
      }
      onUpdate();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newRepertoireName.trim()) return;
    
    setCreateLoading(true);
    setError('');
    
    try {
      // Create new repertoire
      const newRepertoire = await createRepertoire(user.uid, { 
        name: newRepertoireName.trim() 
      });
      
      // Add opening to the new repertoire
      await addOpeningToRepertoire(user.uid, newRepertoire.id, opening.uniqueId);
      
      // Reset form and close modal
      setNewRepertoireName('');
      setShowCreateForm(false);
      onUpdate();
      onClose(); // Close modal after successful add
    } catch (error) {
      setError(error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const canCreateNew = !userData?.repertoires || userData.repertoires.length < LIMITS.MAX_REPERTOIRES_PER_USER;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="repertoire-selector-modal" onClick={e => e.stopPropagation()}>
        {/* Close button in top-right corner */}
        <button 
          className="modal-close-btn" 
          onClick={onClose} 
          title="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Opening info header */}
        <div className="modal-opening-header">
          <h3 className="opening-name">{opening.name}</h3>
          <div className="opening-eco-badge">{opening.eco}</div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Create New Repertoire Section */}
        {canCreateNew && (
          <div className="create-repertoire-section">
            {!showCreateForm ? (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="create-new-repertoire-btn"
                disabled={createLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create New Repertoire
              </button>
            ) : (
              <form onSubmit={handleCreateAndAdd} className="create-repertoire-form">
                <input
                  type="text"
                  placeholder="Enter repertoire name..."
                  value={newRepertoireName}
                  onChange={(e) => setNewRepertoireName(e.target.value)}
                  maxLength={50}
                  required
                  autoFocus
                  className="repertoire-name-input"
                />
                <div className="form-actions">
                  <button 
                    type="submit" 
                    disabled={createLoading || !newRepertoireName.trim()}
                    className="create-btn"
                  >
                    {createLoading ? 'Creating...' : 'Create & Add'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewRepertoireName('');
                      setError('');
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Existing Repertoires */}
        {userData?.repertoires && userData.repertoires.length > 0 && (
          <div className="existing-repertoires-section">
            {canCreateNew && <div className="section-divider"></div>}
            
            <div className="repertoires-list">
              {userData.repertoires.map(repertoire => {
                const isInRepertoire = repertoire.openings.includes(opening.uniqueId);
                const isFull = repertoire.openings.length >= LIMITS.MAX_OPENINGS_PER_REPERTOIRE;
                
                return (
                  <div key={repertoire.id} className="repertoire-item">
                    <div className="repertoire-info">
                      <h4 className="repertoire-name">{repertoire.name}</h4>
                      <div className="repertoire-meta">
                        <span className="openings-count">
                          {repertoire.openings.length}/{LIMITS.MAX_OPENINGS_PER_REPERTOIRE} openings
                        </span>
                        {isInRepertoire && (
                          <span className="included-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                            Included
                          </span>
                        )}
                        {isFull && !isInRepertoire && (
                          <span className="full-badge">Full</span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggleRepertoire(repertoire.id, isInRepertoire)}
                      disabled={loading || createLoading || (!isInRepertoire && isFull)}
                      className={`toggle-repertoire-btn ${isInRepertoire ? 'remove' : 'add'} ${(!isInRepertoire && isFull) ? 'disabled' : ''}`}
                    >
                      {loading ? (
                        <svg className="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                      ) : isInRepertoire ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Remove
                        </>
                      ) : isFull ? (
                        'Full'
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Add
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Repertoires State */}
        {(!userData?.repertoires || userData.repertoires.length === 0) && !showCreateForm && (
          <div className="no-repertoires-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <h4>No repertoires yet</h4>
            <p>Create your first repertoire to organize this opening!</p>
          </div>
        )}

        {/* Limit Reached */}
        {!canCreateNew && (
          <div className="limit-notice">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <p>Maximum {LIMITS.MAX_REPERTOIRES_PER_USER} repertoires reached</p>
            <small>Delete a repertoire to create a new one</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepertoireSelector;