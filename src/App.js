import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './App.css';

// ChessboardJS Integration Component with Lazy Loading
const ChessboardJS = ({ fen, size = 280, id, flipped = false, isVisible = true, showNotation = false }) => {
  const boardRef = useRef(null);
  const boardInstanceRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  // Only create the board when it becomes visible
  useEffect(() => {
    if (isVisible && !shouldRender) {
      // Small delay to prevent too many boards from loading at once
      const timer = setTimeout(() => setShouldRender(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender]);

  useEffect(() => {
    if (window.ChessBoard && boardRef.current && shouldRender) {
      if (boardInstanceRef.current) {
        boardInstanceRef.current.destroy();
      }

      boardInstanceRef.current = window.ChessBoard(boardRef.current, {
        position: fen || 'start',
        draggable: false,
        showNotation: showNotation,
        orientation: flipped ? 'black' : 'white',
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
      });

      boardInstanceRef.current.resize();
    }

    return () => {
      if (boardInstanceRef.current) {
        boardInstanceRef.current.destroy();
        boardInstanceRef.current = null;
      }
    };
  }, [fen, flipped, shouldRender, showNotation]);

  useEffect(() => {
    if (boardInstanceRef.current && fen) {
      boardInstanceRef.current.position(fen);
    }
  }, [fen]);

  useEffect(() => {
    if (boardInstanceRef.current) {
      boardInstanceRef.current.orientation(flipped ? 'black' : 'white');
    }
  }, [flipped]);

  // Show placeholder until board is ready to render
  if (!shouldRender) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size,
          margin: '0 auto',
          background: 'rgba(115, 115, 115, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#71717a',
          fontSize: '0.8rem'
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div 
      ref={boardRef} 
      id={id}
      style={{ 
        width: size, 
        height: size,
        margin: '0 auto'
      }} 
    />
  );
};

// Enhanced categorization function with better pattern matching
const categorizeOpening = (opening) => {
  if (!opening.pgn) return 'unknown';
  
  const pgn = opening.pgn.toLowerCase().trim();
  const eco = opening.eco || '';
  const name = opening.name ? opening.name.toLowerCase() : '';
  
  // More flexible pattern matching for different PGN notations
  const normalizedPgn = pgn.replace(/\s+/g, ' ');
  
  // Check first move
  if (pgn.startsWith('1. e4') || normalizedPgn.includes('1.e4')) {
    // White plays 1.e4 - check black's response
    if (normalizedPgn.includes('1... e5') || normalizedPgn.includes('1...e5')) {
      return 'white-e4'; // Double King's Pawn openings (e.g., Italian, Spanish)
    } 
    // Black defenses against 1.e4
    else if (normalizedPgn.includes('1... c5') || normalizedPgn.includes('1...c5') || 
             name.includes('sicilian') || eco.startsWith('B')) {
      return 'black-vs-e4'; // Sicilian Defense
    } 
    else if (normalizedPgn.includes('1... e6') || normalizedPgn.includes('1...e6') || 
             name.includes('french') || (eco.startsWith('C') && name.includes('french'))) {
      return 'black-vs-e4'; // French Defense
    } 
    else if (normalizedPgn.includes('1... c6') || normalizedPgn.includes('1...c6') || 
             name.includes('caro') || name.includes('kann')) {
      return 'black-vs-e4'; // Caro-Kann Defense
    } 
    else if (normalizedPgn.includes('1... d5') || normalizedPgn.includes('1...d5') || 
             name.includes('scandinavian') || name.includes('center counter')) {
      return 'black-vs-e4'; // Scandinavian Defense
    } 
    else if (normalizedPgn.includes('1... d6') || normalizedPgn.includes('1...d6') || 
             normalizedPgn.includes('1... g6') || normalizedPgn.includes('1...g6') ||
             normalizedPgn.includes('1... nf6') || normalizedPgn.includes('1...nf6') ||
             name.includes('pirc') || name.includes('modern') || name.includes('alekhine')) {
      return 'black-vs-e4'; // Modern, Pirc, Alekhine defenses
    } 
    else if (normalizedPgn.includes('1... nc6') || normalizedPgn.includes('1...nc6') ||
             name.includes('nimzowitsch')) {
      return 'black-vs-e4'; // Nimzowitsch Defense
    }
    else {
      return 'white-e4'; // Other 1.e4 openings or symmetric
    }
  } 
  else if (pgn.startsWith('1. d4') || normalizedPgn.includes('1.d4')) {
    // White plays 1.d4 - check black's response
    if (normalizedPgn.includes('1... d5') || normalizedPgn.includes('1...d5')) {
      return 'white-d4'; // Queen's Gambit family and other symmetric d4-d5
    } 
    // Black defenses against 1.d4
    else if (normalizedPgn.includes('1... nf6') || normalizedPgn.includes('1...nf6') || 
             name.includes('indian') || name.includes('nimzo') || name.includes('king\'s indian') ||
             name.includes('grunfeld') || eco.startsWith('E')) {
      return 'black-vs-d4'; // Indian Defenses
    } 
    else if (normalizedPgn.includes('1... e6') || normalizedPgn.includes('1...e6') ||
             name.includes('queen\'s indian') || name.includes('nimzo-indian')) {
      return 'black-vs-d4'; // Queen's Indian and related
    } 
    else if (normalizedPgn.includes('1... c5') || normalizedPgn.includes('1...c5') ||
             name.includes('benoni') || name.includes('benko')) {
      return 'black-vs-d4'; // Benoni Defense
    } 
    else if (normalizedPgn.includes('1... f5') || normalizedPgn.includes('1...f5') ||
             name.includes('dutch')) {
      return 'black-vs-d4'; // Dutch Defense
    }
    else if (normalizedPgn.includes('1... nc6') || normalizedPgn.includes('1...nc6') ||
             normalizedPgn.includes('1... g6') || normalizedPgn.includes('1...g6')) {
      return 'black-vs-d4'; // Other black defenses
    }
    else {
      return 'white-d4'; // Other 1.d4 openings
    }
  } 
  else if (pgn.startsWith('1. nf3') || normalizedPgn.includes('1.nf3')) {
    return 'white-other'; // Réti Opening
  } 
  else if (pgn.startsWith('1. c4') || normalizedPgn.includes('1.c4')) {
    return 'white-other'; // English Opening
  } 
  else if (pgn.startsWith('1. f4') || normalizedPgn.includes('1.f4')) {
    return 'white-other'; // Bird's Opening
  } 
  else if (pgn.startsWith('1. b3') || pgn.startsWith('1. g3') || pgn.startsWith('1. nc3') ||
           normalizedPgn.includes('1.b3') || normalizedPgn.includes('1.g3') || normalizedPgn.includes('1.nc3')) {
    return 'white-other'; // Irregular openings
  } 
  else {
    return 'white-other'; // Other first moves
  }
};

// Helper function to parse PGN and extract moves
const parsePGN = (pgn) => {
  if (!pgn) return [];
  
  // Remove move numbers and clean up the PGN
  const cleanPgn = pgn
    .replace(/\d+\.\s*/g, '') // Remove move numbers like "1. "
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Split into individual moves
  const moves = cleanPgn.split(' ').filter(move => move && move !== '');
  
  return moves;
};

// Simple chess position calculator (basic implementation)
// Note: This is a simplified version. For production, you'd want to use chess.js
const calculatePositionAfterMoves = (moves, targetMoveIndex) => {
  // Starting position
  const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKQ - 0 1';
  
  if (targetMoveIndex < 0) {
    return startingFen;
  }
  
  // For now, we'll create approximate positions for common opening moves
  // This is a simplified implementation - ideally you'd use a proper chess engine
  const movesToPlay = moves.slice(0, targetMoveIndex + 1);
  
  // Simple position mappings for common opening moves
  const moveSequence = movesToPlay.join(' ').toLowerCase();
  
  // Basic position mappings (this would be much more sophisticated with chess.js)
  if (moveSequence.includes('nf3') && moveSequence.includes('d5')) {
    if (moveSequence.includes('g3')) {
      return 'rnbqkb1r/ppp1pppp/5n2/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 3';
    }
  }
  
  if (moveSequence.includes('e4') && moveSequence.includes('e5')) {
    return 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';
  }
  
  if (moveSequence.includes('d4') && moveSequence.includes('d5')) {
    return 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2';
  }
  
  // Return null to use the opening's final FEN as fallback
  return null;
};

// Load chess.js from CDN for proper move calculation
const loadChessJS = () => {
  return new Promise((resolve, reject) => {
    if (window.Chess) {
      resolve(window.Chess);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js';
    script.onload = () => {
      if (window.Chess) {
        resolve(window.Chess);
      } else {
        reject(new Error('Chess.js failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load chess.js'));
    document.head.appendChild(script);
  });
};

// Enhanced position calculation using chess.js when available
const getPositionAfterMoves = async (moves, moveIndex, fallbackFen) => {
  try {
    await loadChessJS();
    const Chess = window.Chess;
    
    if (!Chess) {
      return calculatePositionAfterMoves(moves, moveIndex) || fallbackFen;
    }
    
    const game = new Chess();
    
    // Play moves up to the target index
    for (let i = 0; i <= moveIndex && i < moves.length; i++) {
      const move = moves[i];
      try {
        // Try to make the move
        const result = game.move(move);
        if (!result) {
          // If move fails, try with different notation
          const alternativeMoves = [
            move.toLowerCase(),
            move.toUpperCase(),
            move.replace(/[+#]/g, ''), // Remove check/checkmate symbols
          ];
          
          let moveSuccess = false;
          for (const altMove of alternativeMoves) {
            if (game.move(altMove)) {
              moveSuccess = true;
              break;
            }
          }
          
          if (!moveSuccess) {
            console.warn(`Invalid move: ${move} at position ${i}`);
            break;
          }
        }
      } catch (error) {
        console.warn(`Error playing move ${move}:`, error);
        break;
      }
    }
    
    return game.fen();
  } catch (error) {
    console.warn('Chess.js not available, using fallback:', error);
    return calculatePositionAfterMoves(moves, moveIndex) || fallbackFen;
  }
};

// Enhanced search function that includes move notation
const searchInOpening = (opening, query) => {
  const searchFields = [
    opening.name,
    opening.eco,
    opening.pgn,
    opening.parentName,
    opening.description,
    opening.strategy
  ].filter(Boolean).map(field => field.toLowerCase());
  
  // Also search for common chess notation patterns
  const normalizedQuery = query.toLowerCase()
    .replace(/1\.\s*e4/g, '1. e4')
    .replace(/1\.\s*d4/g, '1. d4')
    .replace(/1\.\s*nf3/g, '1. nf3')
    .replace(/1\.\s*c4/g, '1. c4');
  
  return searchFields.some(field => field.includes(normalizedQuery));
};

const useIntersectionObserver = (ref, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return isVisible;
};

// Pagination Component
const PaginatedGrid = ({ items, itemsPerPage = 20, renderItem }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="paginated-grid">
      <div className="openings-grid">
        {currentItems.map((item, index) => renderItem(item, startIndex + index))}
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage > totalPages - 3) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
      
      <div className="pagination-info">
        Showing {startIndex + 1}-{Math.min(endIndex, items.length)} of {items.length} openings
      </div>
    </div>
  );
};

// Icons
const StarIcon = ({ isFavorite }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "#fbbf24" : "none"} stroke={isFavorite ? "#fbbf24" : "currentColor"} strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
);

const FlipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9"></polyline>
    <path d="m21 5H9a4 4 0 0 0-4 4v6"></path>
    <polyline points="7 23 3 19 7 15"></polyline>
    <path d="M3 19h12a4 4 0 0 0 4-4V9"></path>
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
    <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
    <line x1="11" y1="13" x2="13" y2="11"></line>
  </svg>
);

const SkipToStartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="19,20 9,12 19,4"></polygon>
    <line x1="5" y1="19" x2="5" y2="5"></line>
  </svg>
);

const StepBackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="15,18 9,12 15,6"></polygon>
  </svg>
);

const StepForwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="9,18 15,12 9,6"></polygon>
  </svg>
);

const SkipToEndIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,4 15,12 5,20"></polygon>
    <line x1="19" y1="5" x2="19" y2="19"></line>
  </svg>
);

// Lazy Loading Opening Card Component
const OpeningCard = ({ opening, onSelect, onToggleFavorite, isFavorite }) => {
  const cardRef = useRef(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.1 });

  return (
    <div ref={cardRef} className="opening-card" onClick={() => onSelect(opening)}>
      <div className="opening-header">
        <div className="opening-info">
          <h3 className="opening-title">{opening.name}</h3>
          {opening.parentName && (
            <p className="opening-parent">
              <LinkIcon />
              {opening.parentName}
            </p>
          )}
          <p className="opening-moves">{opening.pgn}</p>
        </div>
        <div className="opening-badges">
          <span className="eco-code">{opening.eco}</span>
        </div>
      </div>
      
      <div className="board-container">
        <ChessboardJS 
          fen={opening.fen} 
          size={260} 
          id={`board-${opening.uniqueId}`}
          isVisible={isVisible}
        />
      </div>
      
      <button 
        className="favorite-btn" 
        onClick={(e) => { 
          e.stopPropagation(); 
          onToggleFavorite(opening.uniqueId); 
        }}
      >
        <StarIcon isFavorite={isFavorite} />
        {isFavorite ? 'Favorited' : 'Add to Favorites'}
      </button>
    </div>
  );
};

// Detail View Component
const DetailView = ({ opening, onBack, onToggleFavorite, isFavorite, onOpeningSelect, allOpenings }) => {
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // -1 means final position
  const [moves, setMoves] = useState([]);
  const [currentPosition, setCurrentPosition] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Parse moves when opening changes
  useEffect(() => {
    const parsedMoves = parsePGN(opening.pgn);
    setMoves(parsedMoves);
    setCurrentMoveIndex(parsedMoves.length - 1); // Start at final position (last move index)
    setCurrentPosition(opening.fen);
  }, [opening]);

  // Calculate position when move index changes
  useEffect(() => {
    const calculatePosition = async () => {
      if (moves.length === 0) return;
      
      setIsCalculating(true);
      
      if (currentMoveIndex === -1) {
        // Starting position
        setCurrentPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      } else if (currentMoveIndex === moves.length - 1) {
        // Final position
        setCurrentPosition(opening.fen);
      } else {
        // Intermediate position
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

  // Navigation functions
  const goToStart = () => setCurrentMoveIndex(-1);
  const stepBack = () => {
    if (currentMoveIndex > -1) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };
  const stepForward = () => {
    if (currentMoveIndex < moves.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };
  const goToEnd = () => setCurrentMoveIndex(moves.length - 1);

  // Get current move text for display
  const getCurrentMoveText = () => {
    if (isCalculating) return "Calculating position...";
    if (currentMoveIndex === -1) return "Starting position";
    if (currentMoveIndex === moves.length - 1) return "Final position";
    
    const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
    const isWhiteMove = currentMoveIndex % 2 === 0;
    const move = moves[currentMoveIndex];
    
    return `${moveNumber}.${isWhiteMove ? '' : '..'} ${move}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#22c55e';
      case 'intermediate': return '#f97316';
      case 'advanced': return '#ef4444';
      default: return '#71717a';
    }
  };

  return (
    <div className="detail-view">
      <header className="detail-header">
        <button onClick={onBack} className="back-btn">
          <ArrowLeftIcon />
          Back to All Openings
        </button>
      </header>
      
      <main className="detail-content">
        <div className="detail-info">
          <div className="detail-title-section">
            <h1 className="detail-title">{opening.name}</h1>
            <div className="detail-meta">
              <span className="detail-eco">{opening.eco}</span>
              {opening.difficulty && (
                <span 
                  className="difficulty-badge"
                  style={{ 
                    backgroundColor: `${getDifficultyColor(opening.difficulty)}20`,
                    color: getDifficultyColor(opening.difficulty),
                    border: `1px solid ${getDifficultyColor(opening.difficulty)}40`
                  }}
                >
                  {opening.difficulty}
                </span>
              )}
            </div>
          </div>

          <div className="mobile-board-section">
            <ChessboardJS 
              fen={currentPosition} 
              size={300} 
              id={`mobile-board-${opening.eco}`}
              flipped={boardFlipped}
              isVisible={true}
              showNotation={true}
            />
            
            <div className="move-navigation">
              <div className="move-status">
                {getCurrentMoveText()}
              </div>
              <div className="move-controls">
                <button 
                  onClick={goToStart}
                  disabled={currentMoveIndex === -1 || isCalculating}
                  className="move-btn"
                  title="Go to start"
                >
                  <SkipToStartIcon />
                </button>
                <button 
                  onClick={stepBack}
                  disabled={currentMoveIndex <= -1 || isCalculating}
                  className="move-btn"
                  title="Previous move"
                >
                  <StepBackIcon />
                </button>
                <button 
                  onClick={stepForward}
                  disabled={currentMoveIndex >= moves.length - 1 || isCalculating}
                  className="move-btn"
                  title="Next move"
                >
                  <StepForwardIcon />
                </button>
                <button 
                  onClick={goToEnd}
                  disabled={currentMoveIndex === moves.length - 1 || isCalculating}
                  className="move-btn"
                  title="Go to end"
                >
                  <SkipToEndIcon />
                </button>
              </div>
            </div>
            
            <div className="board-action-buttons">
              <button 
                onClick={() => setBoardFlipped(!boardFlipped)}
                className="detail-action-btn"
              >
                <FlipIcon />
                Flip Board
              </button>
              
              <button 
                onClick={() => onToggleFavorite(opening.uniqueId)} 
                className={`detail-action-btn ${isFavorite ? 'active' : ''}`}
              >
                <StarIcon isFavorite={isFavorite} />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>
          </div>

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
        
        <div className="desktop-board-section">
          <ChessboardJS 
            fen={currentPosition} 
            size={400} 
            id={`desktop-board-${opening.eco}`}
            flipped={boardFlipped}
            isVisible={true}
            showNotation={true}
          />
          
          <div className="move-navigation">
            <div className="move-status">
              {getCurrentMoveText()}
            </div>
            <div className="move-controls">
              <button 
                onClick={goToStart}
                disabled={currentMoveIndex === -1 || isCalculating}
                className="move-btn"
                title="Go to start"
              >
                <SkipToStartIcon />
              </button>
              <button 
                onClick={stepBack}
                disabled={currentMoveIndex <= -1 || isCalculating}
                className="move-btn"
                title="Previous move"
              >
                <StepBackIcon />
              </button>
              <button 
                onClick={stepForward}
                disabled={currentMoveIndex >= moves.length - 1 || isCalculating}
                className="move-btn"
                title="Next move"
              >
                <StepForwardIcon />
              </button>
              <button 
                onClick={goToEnd}
                disabled={currentMoveIndex === moves.length - 1 || isCalculating}
                className="move-btn"
                title="Go to end"
              >
                <SkipToEndIcon />
              </button>
            </div>
          </div>
          
          <div className="board-action-buttons">
            <button 
              onClick={() => setBoardFlipped(!boardFlipped)}
              className="detail-action-btn"
            >
              <FlipIcon />
              Flip Board
            </button>
            
            <button 
              onClick={() => onToggleFavorite(opening.uniqueId)} 
              className={`detail-action-btn ${isFavorite ? 'active' : ''}`}
            >
              <StarIcon isFavorite={isFavorite} />
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Filter Dropdown Component
const FilterDropdown = ({ activeFilter, onFilterChange, counts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filters = [
    { key: 'all', label: 'All Openings', count: counts.all },
    { key: 'A', label: 'ECO A - Flank & Irregular', count: counts.A },
    { key: 'B', label: 'ECO B - Semi-Open', count: counts.B },
    { key: 'C', label: 'ECO C - Open Games', count: counts.C },
    { key: 'D', label: 'ECO D - Closed Games', count: counts.D },
    { key: 'E', label: 'ECO E - Indian Defenses', count: counts.E }
  ];

  const activeFilterData = filters.find(f => f.key === activeFilter) || filters[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterSelect = (filterKey) => {
    onFilterChange(filterKey);
    setIsOpen(false);
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="filter-dropdown-button"
      >
        <span className="filter-dropdown-text">
          {activeFilterData.label} ({activeFilterData.count})
        </span>
        <svg 
          className={`filter-dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>
      
      {isOpen && (
        <div className="filter-dropdown-menu">
          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => handleFilterSelect(filter.key)}
              className={`filter-dropdown-item ${activeFilter === filter.key ? 'active' : ''}`}
            >
              <span className="filter-item-label">{filter.label}</span>
              <span className="filter-item-count">({filter.count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [openings, setOpenings] = useState([]);
  const [filteredOpenings, setFilteredOpenings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOpening, setSelectedOpening] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chessboardLoaded, setChessboardLoaded] = useState(false);

  // Load ChessboardJS library
  useEffect(() => {
    if (window.ChessBoard) {
      setChessboardLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css';
    document.head.appendChild(link);

    const loadScript = (src, onLoad) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = onLoad;
      script.onerror = () => setError(`Failed to load script: ${src}`);
      document.head.appendChild(script);
      return script;
    };

    loadScript(
      'https://code.jquery.com/jquery-3.7.1.min.js',
      () => {
        loadScript(
          'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js',
          () => {
            setChessboardLoaded(true);
          }
        );
      }
    );

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, []);

  // Load data and favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem('chess-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    fetch(`${process.env.PUBLIC_URL}/openings.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch openings data');
        return res.json();
      })
      .then(data => {
        console.log('Loaded openings:', data.length);
        
        // Add unique IDs to handle duplicate ECO codes
        const openingsWithIds = data.map((opening, index) => ({
          ...opening,
          uniqueId: `${opening.eco || 'unknown'}-${index}`,
          // Ensure all required fields exist
          eco: opening.eco || `UNKNOWN-${index}`,
          name: opening.name || 'Unknown Opening',
          pgn: opening.pgn || '1. ?',
          fen: opening.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        }));
        
        setOpenings(openingsWithIds);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading openings:', err);
        setError('Failed to load openings data');
        setLoading(false);
      });
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('chess-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Filter openings
  useEffect(() => {
    if (openings.length === 0) return; // Don't filter if no openings loaded yet
    
    let filtered = [...openings]; // Create a copy to avoid mutation
    console.log('Starting filter with', filtered.length, 'openings');

    // Apply main lines filter if needed
    if (activeFilter === 'main') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(opening => opening.isMainLine !== false);
      console.log('After main lines filter:', beforeCount, '->', filtered.length);
    }
    
    // Apply specific filters
    else if (activeFilter === 'fav') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(opening => favorites.includes(opening.uniqueId));
      console.log('After favorites filter:', beforeCount, '->', filtered.length);
    } 
    
    // Move-based filters
    else if (activeFilter === 'white-e4') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(opening => {
        const category = categorizeOpening(opening);
        return category === 'white-e4';
      });
      console.log('After 1.e4 white filter:', beforeCount, '->', filtered.length);
    }
    
    else if (activeFilter === 'white-d4') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(opening => {
        const category = categorizeOpening(opening);
        return category === 'white-d4';
      });
      console.log('After 1.d4 white filter:', beforeCount, '->', filtered.length);
    }
    
    else if (activeFilter === 'white-other') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(opening => {
        const category = categorizeOpening(opening);
        return category === 'white-other';
      });
      console.log('After other white moves filter:', beforeCount, '->', filtered.length);
    }
    
    else if (activeFilter === 'black-vs-e4') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(opening => {
        const category = categorizeOpening(opening);
        return category === 'black-vs-e4';
      });
      console.log('After black vs 1.e4 filter:', beforeCount, '->', filtered.length);
    }
    
    else if (activeFilter === 'black-vs-d4') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(opening => {
        const category = categorizeOpening(opening);
        return category === 'black-vs-d4';
      });
      console.log('After black vs 1.d4 filter:', beforeCount, '->', filtered.length);
    }
    
    // ECO-based filters
    else if (activeFilter !== 'all' && ['A', 'B', 'C', 'D', 'E'].includes(activeFilter)) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(opening => {
        const ecoCode = opening.eco;
        const matches = ecoCode && ecoCode.startsWith(activeFilter);
        return matches;
      });
      console.log(`After ECO ${activeFilter} filter:`, beforeCount, '->', filtered.length);
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim() !== '') {
      const beforeCount = filtered.length;
      const query = searchQuery.trim();
      filtered = filtered.filter(opening => searchInOpening(opening, query));
      console.log('After search filter:', beforeCount, '->', filtered.length);
    }

    console.log('Final filtering results:', {
      activeFilter,
      searchQuery: searchQuery || 'none',
      originalCount: openings.length,
      finalCount: filtered.length,
      sampleResults: filtered.slice(0, 3).map(o => `${o.eco}: ${o.name}`)
    });

    setFilteredOpenings(filtered);
  }, [openings, activeFilter, searchQuery, favorites]);

  // Calculate counts for filter tabs
  const counts = useMemo(() => {
    if (openings.length === 0) return {};
    
    // Calculate move-based categories
    const moveCategories = openings.reduce((acc, opening) => {
      const category = categorizeOpening(opening);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    return {
      all: openings.length,
      main: openings.filter(o => o.isMainLine !== false).length,
      whiteE4: moveCategories['white-e4'] || 0,
      whiteD4: moveCategories['white-d4'] || 0,
      whiteOther: moveCategories['white-other'] || 0,
      blackVsE4: moveCategories['black-vs-e4'] || 0,
      blackVsD4: moveCategories['black-vs-d4'] || 0,
      A: openings.filter(o => o.eco && o.eco.startsWith('A')).length,
      B: openings.filter(o => o.eco && o.eco.startsWith('B')).length,
      C: openings.filter(o => o.eco && o.eco.startsWith('C')).length,
      D: openings.filter(o => o.eco && o.eco.startsWith('D')).length,
      E: openings.filter(o => o.eco && o.eco.startsWith('E')).length,
      fav: favorites.length
    };
  }, [openings, favorites]);

  const toggleFavorite = (uniqueId) => {
    setFavorites(prev => 
      prev.includes(uniqueId) 
        ? prev.filter(fav => fav !== uniqueId)
        : [...prev, uniqueId]
    );
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('chess-favorites');
  };

  const handleOpeningSelect = (opening) => {
    setSelectedOpening(opening);
    // Scroll to top when opening detail view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedOpening(null);
    // Scroll to top when returning to main view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading || !chessboardLoaded) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading chess openings... ({openings.length > 0 ? `${openings.length} loaded` : ''})</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (selectedOpening) {
    return (
      <div className="app">
        <DetailView
          opening={selectedOpening}
          onBack={handleBack}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(selectedOpening.uniqueId)}
          onOpeningSelect={handleOpeningSelect}
          allOpenings={openings}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Chess Opening Explorer</h1>
        <p className="app-subtitle">Interactive Chess Opening Database</p>
      </header>

      <main className="main-content">
        <div className="search-section">
          <div className="search-bar">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search openings, moves (e.g. '1.e4', 'Sicilian'), ECO codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="controls-section">
          <FilterDropdown
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />
          
          <button
            onClick={() => setActiveFilter('fav')}
            className={`favorites-btn ${activeFilter === 'fav' ? 'active' : ''}`}
            disabled={counts.fav === 0}
          >
            <StarIcon isFavorite={true} />
            Favorites ({counts.fav})
          </button>
        </div>

        <section className="openings-section">
          <div className="section-header">
            <h2 className="section-title">
              {activeFilter === 'all' ? 'All Openings' : 
               activeFilter === 'main' ? 'Main Lines Only' :
               activeFilter === 'fav' ? 'Your Favorites' : 
               `ECO ${activeFilter} Openings`} ({filteredOpenings.length})
            </h2>
          </div>

          {filteredOpenings.length === 0 ? (
            <div className="no-results">
              <p>No openings found matching your criteria.</p>
              {activeFilter === 'fav' && favorites.length > 0 && (
                <button 
                  onClick={clearAllFavorites}
                  className="clear-favorites-btn"
                  style={{
                    marginTop: '15px',
                    padding: '8px 16px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    color: '#ef4444',
                    cursor: 'pointer'
                  }}
                >
                  Clear All Favorites
                </button>
              )}
            </div>
          ) : (
            <div className="openings-grid">
              {filteredOpenings.map((opening, index) => (
                <OpeningCard
                  key={opening.uniqueId || `${opening.eco}-${index}`}
                  opening={opening}
                  onSelect={handleOpeningSelect}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(opening.uniqueId)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;

/* CSS for move navigation controls */
const styles = `
.controls-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.filter-dropdown {
  min-width: 320px;
  max-width: 500px;
  flex: 1;
}

.favorites-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(38, 38, 38, 0.8);
  border: 1px solid rgba(115, 115, 115, 0.3);
  border-radius: 12px;
  color: #d4d4d8;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 140px;
}

.favorites-btn:hover:not(:disabled) {
  background: rgba(64, 64, 64, 0.8);
  border-color: #fbbf24;
  color: #fbbf24;
  transform: translateY(-1px);
}

.favorites-btn.active {
  background: rgba(251, 191, 36, 0.15);
  border-color: #fbbf24;
  color: #fbbf24;
}

.favorites-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.move-navigation {
  margin: 20px 0;
  text-align: center;
}

.move-status {
  font-size: 0.9rem;
  color: #a3a3a3;
  margin-bottom: 15px;
  font-weight: 500;
}

.move-controls {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
}

.move-btn {
  padding: 8px 12px;
  background: rgba(38, 38, 38, 0.8);
  border: 1px solid rgba(115, 115, 115, 0.3);
  border-radius: 6px;
  color: #d4d4d8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  min-width: 40px;
  height: 40px;
}

.move-btn:hover:not(:disabled) {
  background: rgba(64, 64, 64, 0.8);
  border-color: #22c55e;
  color: #22c55e;
  transform: translateY(-1px);
}

.move-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .controls-section {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-dropdown {
    min-width: auto;
    width: 100%;
  }
  
  .favorites-btn {
    width: 100%;
    justify-content: center;
  }
  
  .move-controls {
    gap: 6px;
  }
  
  .move-btn {
    min-width: 36px;
    height: 36px;
    padding: 6px 10px;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}