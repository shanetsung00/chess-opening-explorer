// components/RepertoireManager.js - Updated with clickable repertoire names
import React, { useState } from 'react';
import { 
  createRepertoire, 
  updateRepertoireName, 
  deleteRepertoire,
  LIMITS 
} from '../utils/authUtils';

const RepertoireManager = ({ user, userRepertoires, onRepertoireUpdate, onViewRepertoire }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRepertoireName, setNewRepertoireName] = useState('');
  const [editingRepertoire, setEditingRepertoire] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRepertoire = async (e) => {
    e.preventDefault();
    if (!newRepertoireName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await createRepertoire(user.uid, { name: newRepertoireName.trim() });
      setNewRepertoireName('');
      setShowCreateForm(false);
      onRepertoireUpdate();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (repertoireId, newName) => {
    if (!newName.trim()) return;
    
    setError('');
    
    try {
      await updateRepertoireName(user.uid, repertoireId, newName.trim());
      setEditingRepertoire(null);
      onRepertoireUpdate();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteRepertoire = async (repertoireId, repertoireName) => {
    if (!window.confirm(`Delete repertoire "${repertoireName}"? This cannot be undone.`)) {
      return;
    }
    
    setError('');
    
    try {
      await deleteRepertoire(user.uid, repertoireId);
      onRepertoireUpdate();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleKeyPress = (e, repertoireId) => {
    if (e.key === 'Enter') {
      handleUpdateName(repertoireId, e.target.value);
    } else if (e.key === 'Escape') {
      setEditingRepertoire(null);
    }
  };

  const handleRepertoireClick = (repertoire) => {
    if (editingRepertoire === repertoire.id) return; // Don't navigate when editing
    if (onViewRepertoire) {
      onViewRepertoire(repertoire);
    }
  };

  return (
    <div className="repertoire-manager">
      <div className="repertoire-header">
        <h3>My Repertoires ({userRepertoires.length}/{LIMITS.MAX_REPERTOIRES_PER_USER})</h3>
        {userRepertoires.length < LIMITS.MAX_REPERTOIRES_PER_USER && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="create-repertoire-btn"
            disabled={loading}
          >
            + New Repertoire
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreateRepertoire} className="create-form">
          <input
            type="text"
            placeholder="Repertoire name (e.g., 'Sicilian Defense', 'King's Indian Attack')"
            value={newRepertoireName}
            onChange={(e) => setNewRepertoireName(e.target.value)}
            maxLength={50}
            required
            autoFocus
          />
          <div className="form-actions">
            <button type="submit" disabled={loading || !newRepertoireName.trim()}>
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setShowCreateForm(false);
                setNewRepertoireName('');
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="repertoire-list">
        {userRepertoires.length === 0 ? (
          <div className="no-repertoires">
            <h4>No repertoires yet</h4>
            <p>Create your first repertoire to start organizing your favorite openings!</p>
          </div>
        ) : (
          userRepertoires.map(repertoire => (
            <div key={repertoire.id} className="repertoire-item">
              {editingRepertoire === repertoire.id ? (
                <input
                  type="text"
                  defaultValue={repertoire.name}
                  onBlur={(e) => handleUpdateName(repertoire.id, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, repertoire.id)}
                  maxLength={50}
                  autoFocus
                  className="repertoire-name-input"
                />
              ) : (
                <div 
                  className="repertoire-info clickable-repertoire"
                  onClick={() => handleRepertoireClick(repertoire)}
                  title="Click to view repertoire openings"
                >
                  <h4>{repertoire.name}</h4>
                  <p>{repertoire.openings.length}/{LIMITS.MAX_OPENINGS_PER_REPERTOIRE} openings</p>
                  {repertoire.description && (
                    <p className="repertoire-description">{repertoire.description}</p>
                  )}
                  <p className="repertoire-date">
                    Created {new Date(repertoire.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="repertoire-actions">
                <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingRepertoire(repertoire.id);
                }}
                disabled={editingRepertoire === repertoire.id}
                title="Edit repertoire name"
                className="action-btn edit-btn" // <-- ADD THIS CLASSNAME
              >
                Edit Name
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRepertoire(repertoire.id, repertoire.name);
                }}
                className="action-btn delete-btn" // <-- ADD "action-btn" CLASS HERE
                title="Delete repertoire"
              >
                Delete
              </button>
            </div>
            </div>
          ))
        )}
      </div>

      {userRepertoires.length >= LIMITS.MAX_REPERTOIRES_PER_USER && (
        <div className="limit-notice">
          <p>You've reached the maximum of {LIMITS.MAX_REPERTOIRES_PER_USER} repertoires.</p>
          <p>Delete a repertoire to create a new one.</p>
        </div>
      )}
    </div>
  );
};

export default RepertoireManager;