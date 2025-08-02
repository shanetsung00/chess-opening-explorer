// components/ChessboardJS.js
import React, { useState, useEffect, useRef } from 'react';

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

export default ChessboardJS;