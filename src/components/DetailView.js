import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
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

// This is now a standalone component, moved OUTSIDE of DetailView
// It receives all the data and functions it needs as props.
const BoardComponent = ({ 
  size, 
  currentPosition, 
  boardFlipped, 
  currentMoveText, 
  isAtStart,
  isAtEnd,
  isFavorite,
  user,
  opening,
  onGoToStart, 
  onStepBack, 
  onStepForward, 
  onGoToEnd, 
  onFlip, 
  onToggleFavorite 
}) => (
  <>
    <ChessboardJS 
      fen={currentPosition} 
      size={size}
      flipped={boardFlipped}
      showNotation={true}
      isVisible={true}
    />
    <div className="move-navigation">
      <div className="move-status">{currentMoveText}</div>
      <div className="move-controls">
        <button className="move-btn" onClick={onGoToStart} disabled={isAtStart} title="Go to start"><SkipToStartIcon /></button>
        <button className="move-btn" onClick={onStepBack} disabled={isAtStart} title="Previous move"><StepBackIcon /></button>
        <button className="move-btn" onClick={onStepForward} disabled={isAtEnd} title="Next move"><StepForwardIcon /></button>
        <button className="move-btn" onClick={onGoToEnd} disabled={isAtEnd} title="Go to end"><SkipToEndIcon /></button>
      </div>
    </div>
    <div className="board-action-buttons">
      <button className="detail-action-btn" onClick={onFlip}><FlipIcon /> Flip Board</button>
      <button className={`detail-action-btn ${isFavorite ? 'active' : ''}`} onClick={() => onToggleFavorite(opening)} disabled={!user} title={!user ? 'Sign in to add to repertoires' : isFavorite ? 'In repertoire(s)' : 'Add to Repertoire'}>
        <RepertoireIcon />
        {!user ? 'Sign in to add' : isFavorite ? 'In Repertoire' : 'Add to Repertoire'}
      </button>
    </div>
  </>
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
  
  const mobileBoardContainerRef = useRef(null);
  const [mobileBoardSize, setMobileBoardSize] = useState(300);

  useLayoutEffect(() => {
    const updateSize = () => {
      if (mobileBoardContainerRef.current) {
        const newSize = mobileBoardContainerRef.current.offsetWidth - 2; 
        setMobileBoardSize(newSize > 0 ? newSize : 300);
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize(); 
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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

  const getCurrentMoveText = () => {
    if (isCalculating) return "Calculating position...";
    if (currentMoveIndex === -1) return "Starting position";
    if (currentMoveIndex === moves.length - 1) return "Final position";
    
    const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
    const isWhiteMove = currentMoveIndex % 2 === 0;
    const move = moves[currentMoveIndex];
    
    return `${moveNumber}.${isWhiteMove ? '' : '..'} ${move}`;
  };

  // Create an object of props to pass to the BoardComponent
  const boardProps = {
    currentPosition: currentPosition,
    boardFlipped: boardFlipped,
    currentMoveText: getCurrentMoveText(),
    isAtStart: currentMoveIndex === -1,
    isAtEnd: currentMoveIndex === moves.length - 1,
    isFavorite: isFavorite,
    user: user,
    opening: opening,
    onGoToStart: () => setCurrentMoveIndex(-1),
    onStepBack: () => currentMoveIndex > -1 && setCurrentMoveIndex(currentMoveIndex - 1),
    onStepForward: () => currentMoveIndex < moves.length - 1 && setCurrentMoveIndex(currentMoveIndex + 1),
    onGoToEnd: () => setCurrentMoveIndex(moves.length - 1),
    onFlip: () => setBoardFlipped(!boardFlipped),
    onToggleFavorite: onToggleFavorite
  };

  return (
    <div className="detail-view">
      <header className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeftIcon />
          <span className="back-text">Back to Openings</span>
        </button>
      </header>

      <main className="detail-content">
        <div className="detail-info-panel" ref={mobileBoardContainerRef}>
          <div className="detail-title-section">
            <h1 className="detail-title">{opening.name}</h1>
            <div className="detail-meta">
              <span className="detail-eco">{opening.eco || '—'}</span>
            </div>
          </div>

          <div className="mobile-board-panel">
            <BoardComponent {...boardProps} size={mobileBoardSize} />
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
        
        <div className="detail-board-panel">
          <BoardComponent {...boardProps} size={400} />
        </div>
      </main>
    </div>
  );
};

export default DetailView;
