// utils/chessUtils.js

// Enhanced categorization function with better pattern matching
export const categorizeOpening = (opening) => {
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
export const parsePGN = (pgn) => {
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
export const calculatePositionAfterMoves = (moves, targetMoveIndex) => {
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
export const loadChessJS = () => {
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
export const getPositionAfterMoves = async (moves, moveIndex, fallbackFen) => {
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