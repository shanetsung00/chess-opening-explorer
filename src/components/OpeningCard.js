// src/components/OpeningCard.js
import React, { useRef } from 'react';
import ChessboardJS from './ChessboardJS';
import { LinkIcon } from './Icons';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

// Updated repertoire icon
const RepertoireIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const OpeningCard = ({
  opening,
  onSelect,
  onAddToRepertoire,
  isInAnyRepertoire,
  user,
  scrollRoot = null,
  currentRepertoire = null, // New prop to indicate if viewing a specific repertoire
}) => {
  const cardRef   = useRef(null);
  const isVisible = useIntersectionObserver(cardRef, {
    root: scrollRoot ? scrollRoot.current : null,
  });

  const handleAddToRepertoire = (e) => {
    e.stopPropagation();
    onAddToRepertoire(opening);
  };

  // Determine if we're in a specific repertoire view
  const isInCurrentRepertoire = currentRepertoire && currentRepertoire.openings.includes(opening.uniqueId);
  const isRepertoireView = !!currentRepertoire;
  
  // Process the raw PGN to keep turn numbers, then truncate.
  // We split by space and take the first 15 parts, which is about 5 full turns (10 moves).
  const pgnParts = opening.pgn ? opening.pgn.split(' ') : [];
  const notation = pgnParts.slice(0, 15).join(' ');
  const truncatedNotation = pgnParts.length > 15 ? `${notation} ...` : notation;

  return (
    <div
      ref={cardRef}
      className="opening-card"
      onClick={() => onSelect(opening)}
    >
      {/* Header with title and ECO code badge */}
      <div className="opening-card-header">
        <div className="opening-title-section">
          <h3 className="opening-card-title">{opening.name}</h3>
          
          {truncatedNotation && (
            <p className="opening-moves">{truncatedNotation}</p>
          )}

          {opening.parentName && (
            <p className="opening-parent">
              <LinkIcon />
              {opening.parentName}
            </p>
          )}
        </div>

        <div className="eco-badge">
          {opening.eco || '—'}
        </div>
      </div>

      {/* Chessboard */}
      <div className="opening-card-board">
        {isVisible ? (
          <ChessboardJS fen={opening.fen} />
        ) : (
          <div className="board-skeleton">Loading…</div>
        )}
      </div>

      {/* Add to Repertoire Button */}
      <button
        className={`add-to-repertoire-btn ${
          isRepertoireView 
            ? (isInCurrentRepertoire ? 'remove-from-repertoire' : 'not-in-current') 
            : (isInAnyRepertoire ? 'in-repertoire' : '')
        }`}
        onClick={handleAddToRepertoire}
        disabled={!user}
        title={
          !user 
            ? 'Sign in to manage repertoires' 
            : isRepertoireView
              ? (isInCurrentRepertoire ? 'Remove from this repertoire' : 'Add to repertoires')
              : (isInAnyRepertoire ? 'In repertoire(s)' : 'Add to repertoire')
        }
      >
        <RepertoireIcon />
        {!user 
          ? 'Sign in to add' 
          : isRepertoireView
            ? (isInCurrentRepertoire ? 'Remove from Repertoire' : 'Add to Repertoires')
            : (isInAnyRepertoire ? 'In Repertoire' : 'Add to Repertoire')
        }
      </button>
    </div>
  );
};

export default OpeningCard;