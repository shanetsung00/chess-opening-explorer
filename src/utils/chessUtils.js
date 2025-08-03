// utils/chessUtils.js

// A single promise to ensure chess.js is only loaded once.
let chessJsPromise = null;
const loadChessJs = () => {
  if (!chessJsPromise) {
    chessJsPromise = new Promise((resolve, reject) => {
      // If the script is already on the page, resolve immediately.
      if (typeof window.Chess !== 'undefined') {
        return resolve(window.Chess);
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js';
      script.onload = () => resolve(window.Chess);
      script.onerror = () => {
        // Reset the promise on error to allow future retries.
        chessJsPromise = null;
        reject(new Error('Failed to load chess.js'));
      };
      document.head.appendChild(script);
    });
  }
  return chessJsPromise;
};


// This function is unchanged
export const categorizeOpening = (opening) => {
  if (!opening.pgn) return 'unknown';
  const pgn = opening.pgn.toLowerCase().trim();
  const eco = opening.eco || '';
  const name = opening.name ? opening.name.toLowerCase() : '';
  const normalizedPgn = pgn.replace(/\s+/g, ' ');
  if (pgn.startsWith('1. e4') || normalizedPgn.includes('1.e4')) {
    if (normalizedPgn.includes('1... e5') || normalizedPgn.includes('1...e5')) return 'white-e4';
    else if (normalizedPgn.includes('1... c5') || normalizedPgn.includes('1...c5') || name.includes('sicilian') || eco.startsWith('B')) return 'black-vs-e4';
    else if (normalizedPgn.includes('1... e6') || normalizedPgn.includes('1...e6') || name.includes('french') || (eco.startsWith('C') && name.includes('french'))) return 'black-vs-e4';
    else if (normalizedPgn.includes('1... c6') || normalizedPgn.includes('1...c6') || name.includes('caro') || name.includes('kann')) return 'black-vs-e4';
    else if (normalizedPgn.includes('1... d5') || normalizedPgn.includes('1...d5') || name.includes('scandinavian') || name.includes('center counter')) return 'black-vs-e4';
    else if (normalizedPgn.includes('1... d6') || normalizedPgn.includes('1...d6') || normalizedPgn.includes('1... g6') || normalizedPgn.includes('1...g6') || normalizedPgn.includes('1... nf6') || normalizedPgn.includes('1...nf6') || name.includes('pirc') || name.includes('modern') || name.includes('alekhine')) return 'black-vs-e4';
    else if (normalizedPgn.includes('1... nc6') || normalizedPgn.includes('1...nc6') || name.includes('nimzowitsch')) return 'black-vs-e4';
    else return 'white-e4';
  }
  else if (pgn.startsWith('1. d4') || normalizedPgn.includes('1.d4')) {
    if (normalizedPgn.includes('1... d5') || normalizedPgn.includes('1...d5')) return 'white-d4';
    else if (normalizedPgn.includes('1... nf6') || normalizedPgn.includes('1...nf6') || name.includes('indian') || name.includes('nimzo') || name.includes('king\'s indian') || name.includes('grunfeld') || eco.startsWith('E')) return 'black-vs-d4';
    else if (normalizedPgn.includes('1... e6') || normalizedPgn.includes('1...e6') || name.includes('queen\'s indian') || name.includes('nimzo-indian')) return 'black-vs-d4';
    else if (normalizedPgn.includes('1... c5') || normalizedPgn.includes('1...c5') || name.includes('benoni') || name.includes('benko')) return 'black-vs-d4';
    else if (normalizedPgn.includes('1... f5') || normalizedPgn.includes('1...f5') || name.includes('dutch')) return 'black-vs-d4';
    else if (normalizedPgn.includes('1... nc6') || normalizedPgn.includes('1...nc6') || normalizedPgn.includes('1... g6') || normalizedPgn.includes('1...g6')) return 'black-vs-d4';
    else return 'white-d4';
  }
  else if (pgn.startsWith('1. nf3') || normalizedPgn.includes('1.nf3')) return 'white-other';
  else if (pgn.startsWith('1. c4') || normalizedPgn.includes('1.c4')) return 'white-other';
  else if (pgn.startsWith('1. f4') || normalizedPgn.includes('1.f4')) return 'white-other';
  else if (pgn.startsWith('1. b3') || pgn.startsWith('1. g3') || pgn.startsWith('1. nc3') || normalizedPgn.includes('1.b3') || normalizedPgn.includes('1.g3') || normalizedPgn.includes('1.nc3')) return 'white-other';
  else return 'white-other';
};

// This function is also unchanged
export const parsePGN = (pgn) => {
  if (!pgn) return [];
  const cleanPgn = pgn.replace(/\d+\.\s*/g, '').replace(/\s+/g, ' ').trim();
  return cleanPgn.split(' ').filter(move => move && move !== '');
};

// This function now uses the robust script loader
export const getPositionAfterMoves = async (moves, moveIndex, finalFen) => {
  // Use the provided final FEN for the last move, as it's the source of truth.
  if (moveIndex === moves.length - 1) {
    return finalFen;
  }

  try {
    const Chess = await loadChessJs();
    const game = new Chess(); // Create a new game from the starting position

    // Replay all moves from the beginning up to the desired point
    for (let i = 0; i <= moveIndex; i++) {
      if (moves[i]) {
        // Use { sloppy: true } to better handle variations in PGN notation
        if (game.move(moves[i], { sloppy: true }) === null) {
          console.warn(`Invalid move in PGN sequence: "${moves[i]}" at index ${i}`);
          // If a move fails, return the last known good position
          return game.fen();
        }
      }
    }
    // Return the FEN of the calculated position
    return game.fen();
  } catch (error) {
    console.error("Error loading or using chess.js:", error);
    // Fallback to the final FEN if the library fails to load
    return finalFen;
  }
};
