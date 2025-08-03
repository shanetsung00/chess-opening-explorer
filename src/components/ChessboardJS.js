// src/components/ChessboardJS.js

import React, { useEffect, useRef } from 'react';

/**
 * A responsive wrapper for the chessboard.js library.
 * This component handles the creation, updating, and resizing of the board.
 */
const ChessboardJS = ({ fen, flipped = false, showNotation = false }) => {
  const boardRef = useRef(null);
  const boardInstanceRef = useRef(null);

  // This primary useEffect hook handles the entire lifecycle of the chessboard.
  // It runs only once when the component mounts.
  useEffect(() => {
    let board = null;

    // Function to initialize the board
    const initBoard = () => {
      if (window.ChessBoard && boardRef.current) {
        board = window.ChessBoard(boardRef.current, {
          position: 'start', // Start with a blank board, will be updated by the next effect
          draggable: false,
          showNotation: showNotation,
          pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
        });
        boardInstanceRef.current = board;
      }
    };

    // Function to handle window resize events
    const handleResize = () => {
      if (boardInstanceRef.current) {
        boardInstanceRef.current.resize();
      }
    };

    initBoard();
    window.addEventListener('resize', handleResize);

    // Cleanup function: This is crucial to prevent memory leaks.
    // It runs when the component is unmounted.
    return () => {
      window.removeEventListener('resize', handleResize);
      if (boardInstanceRef.current) {
        boardInstanceRef.current.destroy();
        boardInstanceRef.current = null;
      }
    };
  }, [showNotation]); // We only need to re-initialize if showNotation changes.

  // A separate effect to update the board's position and orientation
  // when the 'fen' or 'flipped' props change.
  useEffect(() => {
    if (boardInstanceRef.current) {
      boardInstanceRef.current.position(fen, false); // false for no animation
      boardInstanceRef.current.orientation(flipped ? 'black' : 'white');
    }
  }, [fen, flipped]);

  // The component renders a simple div. The board library populates it,
  // and CSS makes it responsive and square.
  return <div ref={boardRef} style={{ width: '100%', aspectRatio: '1 / 1' }} />;
};

export default ChessboardJS;
