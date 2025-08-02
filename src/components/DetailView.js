// components/DetailView.js - Final Corrected Version
import React, { useState, useEffect } from 'react';
import './DetailView.css';
import ChessboardJS from './ChessboardJS';
import { 
  ArrowLeftIcon, 
  FlipIcon,
  SkipToStartIcon,
  StepBackIcon,
  StepForwardIcon,
  SkipToEndIcon
} from './Icons';
import { parsePGN, getPositionAfterMoves } from '../utils/chessUtils';

const RepertoireIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const DetailView = ({ 
  opening, 
  onBack, 
  onToggleFavorite, 
  isFavorite, 
  user, 
}) => {
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [moves, setMoves] = useState([]);
  const [currentPosition, setCurrentPosition] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const parsedMoves = parsePGN(opening.pgn);
    setMoves(parsedMoves);
    setCurrentMoveIndex(parsedMoves.length - 1);
    setCurrentPosition(opening.fen);
  }, [opening]);

  useEffect(() => {
    const calculatePosition = async () => {
      if (moves.length === 0) return;
      
      setIsCalculating(true);
      
      if (currentMoveIndex === -1) {
        setCurrentPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      } else if (currentMoveIndex === moves.length - 1) {
        setCurrentPosition(opening.fen);
      } else {
        try {
          const position = await getPositionAfterMoves(moves, currentMoveIndex, opening.fen);
          setCurrentPosition(position);
        } catch (error) {
          console.warn('Error calculating position:', error);
          setCurrentPosition(opening.fen);
        }
      }
      
      setIsCalculating(false);
    };
    
    calculatePosition();
  }, [currentMoveIndex, moves, opening.fen]);

  const goToStart = () => setCurrentMoveIndex(-1);
  const stepBack = () => currentMoveIndex > -1 && setCurrentMoveIndex(currentMoveIndex - 1);
  const stepForward = () => currentMoveIndex < moves.length - 1 && setCurrentMoveIndex(currentMoveIndex + 1);
  const goToEnd = () => setCurrentMoveIndex(moves.length - 1);

  const getCurrentMoveText = () => {
    if (isCalculating) return "Calculating position...";
    if (currentMoveIndex === -1) return "Starting position";
    if (currentMoveIndex === moves.length - 1) return "Final position";
    
    const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
    const isWhiteMove = currentMoveIndex % 2 === 0;
    const move = moves[currentMoveIndex];
    
    return `${moveNumber}.${isWhiteMove ? '' : '..'} ${move}`;
  };

  return (
    <div className="detail-view">
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeftIcon />
          Back to Openings
        </button>
      </header>

      <main className="detail-content">
        <div className="detail-main">
          <div className="detail-title-section">
            <h1 className="detail-title">{opening.name}</h1>
            <div className="detail-meta">
              <span className="detail-eco">{opening.eco || '—'}</span>
            </div>
          </div>
          <div className="board-section">
            <ChessboardJS 
              fen={currentPosition} 
              size={400} 
              flipped={boardFlipped}
              showNotation={true}
              isVisible={true}
            />
            <div className="move-navigation">
              <div className="move-status">{getCurrentMoveText()}</div>
              <div className="move-controls">
                <button className="move-btn" onClick={goToStart} disabled={currentMoveIndex === -1} title="Go to start"><SkipToStartIcon /></button>
                <button className="move-btn" onClick={stepBack} disabled={currentMoveIndex === -1} title="Previous move"><StepBackIcon /></button>
                <button className="move-btn" onClick={stepForward} disabled={currentMoveIndex === moves.length - 1} title="Next move"><StepForwardIcon /></button>
                <button className="move-btn" onClick={goToEnd} disabled={currentMoveIndex === moves.length - 1} title="Go to end"><SkipToEndIcon /></button>
              </div>
            </div>
            <div className="board-action-buttons">
              <button className="detail-action-btn" onClick={() => setBoardFlipped(!boardFlipped)}><FlipIcon /> Flip Board</button>
              <button className={`detail-action-btn ${isFavorite ? 'active' : ''}`} onClick={() => onToggleFavorite(opening)} disabled={!user} title={!user ? 'Sign in to add to repertoires' : isFavorite ? 'In repertoire(s)' : 'Add to repertoire'}>
                <RepertoireIcon />
                {!user ? 'Sign in to add' : isFavorite ? 'In Repertoire' : 'Add to Repertoire'}
              </button>
            </div>
          </div>
          <div className="detail-info">
            <div className="detail-moves-section">
              <h3 className="section-heading">Opening Moves</h3>
              <p className="detail-moves">{opening.pgn}</p>
            </div>
            {opening.description && (
              <div className="detail-description-section">
                <h3 className="section-heading">Overview</h3>
                <p className="detail-description">{opening.description}</p>
              </div>
            )}
            {opening.strategy && (
              <div className="detail-strategy-section">
                <h3 className="section-heading">Strategic Ideas</h3>
                <p className="detail-strategy">{opening.strategy}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailView;