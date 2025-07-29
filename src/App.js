import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';

// ChessboardJS Integration Component
const ChessboardJS = ({ fen, size = 280, id }) => {
  const boardRef = useRef(null);
  const boardInstanceRef = useRef(null);

  useEffect(() => {
    // Only create board if ChessBoard is available and element exists
    if (window.ChessBoard && boardRef.current) {
      // Destroy existing board if it exists
      if (boardInstanceRef.current) {
        boardInstanceRef.current.destroy();
      }

      // Create new board
      boardInstanceRef.current = window.ChessBoard(boardRef.current, {
        position: fen || 'start',
        draggable: false,
        showNotation: false,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
      });

      // Resize the board
      boardInstanceRef.current.resize();
    }

    // Cleanup function
    return () => {
      if (boardInstanceRef.current) {
        boardInstanceRef.current.destroy();
        boardInstanceRef.current = null;
      }
    };
  }, [fen]);

  // Update position when FEN changes
  useEffect(() => {
    if (boardInstanceRef.current && fen) {
      boardInstanceRef.current.position(fen);
    }
  }, [fen]);

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

// Opening Card Component
const OpeningCard = ({ opening, onSelect, onToggleFavorite, isFavorite }) => (
  <div className="opening-card" onClick={() => onSelect(opening)}>
    <div className="opening-header">
      <div className="opening-info">
        <h3 className="opening-title">{opening.name}</h3>
        <p className="opening-moves">{opening.pgn}</p>
      </div>
      <span className="eco-code">{opening.eco}</span>
    </div>
    
    <div className="board-container">
      <ChessboardJS 
        fen={opening.fen} 
        size={260} 
        id={`board-${opening.eco}`}
      />
    </div>
    
    <button 
      className="favorite-btn" 
      onClick={(e) => { 
        e.stopPropagation(); 
        onToggleFavorite(opening.eco); 
      }}
    >
      <StarIcon isFavorite={isFavorite} />
      {isFavorite ? 'Favorited' : 'Add to Favorites'}
    </button>
  </div>
);

// Filter Tabs Component
const FilterTabs = ({ activeFilter, onFilterChange, counts }) => {
  const filters = [
    { key: 'all', label: 'All Openings', count: counts.all },
    { key: 'A', label: 'A - Flank & Irregular', count: counts.A },
    { key: 'B', label: 'B - Semi-Open', count: counts.B },
    { key: 'C', label: 'C - Open Games', count: counts.C },
    { key: 'D', label: 'D - Closed Games', count: counts.D },
    { key: 'E', label: 'E - Indian Defenses', count: counts.E },
    { key: 'fav', label: '★ Favorites', count: counts.fav }
  ];

  return (
    <div className="filter-tabs">
      <h3 className="filter-title">Filter by ECO Volume</h3>
      <div className="filter-buttons">
        {filters.map(filter => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            disabled={filter.key === 'fav' && filter.count === 0}
            className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>
    </div>
  );
};

// Enhanced Detail View Component
const DetailView = ({ opening, onBack, onToggleFavorite, isFavorite }) => {
  // Difficulty color mapping
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

          {!opening.description && !opening.strategy && !opening.difficulty && (
            <div className="detail-coming-soon">
              <h3 className="section-heading">Detailed Analysis</h3>
              <p className="coming-soon-text">
                📚 Detailed strategic information coming soon! This opening is part of our expansion plan to include comprehensive analysis, typical plans, and key variations.
              </p>
            </div>
          )}
        </div>
        
        <div className="detail-board-section">
          <ChessboardJS 
            fen={opening.fen} 
            size={260} 
            id={`detail-board-${opening.eco}`}
          />
          <button 
            onClick={() => onToggleFavorite(opening.eco)} 
            className={`detail-favorite-btn ${isFavorite ? 'active' : ''}`}
          >
            <StarIcon isFavorite={isFavorite} />
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        </div>
      </main>
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
    // Check if already loaded
    if (window.ChessBoard) {
      setChessboardLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css';
    document.head.appendChild(link);

    // Function to load a script
    const loadScript = (src, onLoad) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = onLoad;
      script.onerror = () => setError(`Failed to load script: ${src}`);
      document.head.appendChild(script);
      return script;
    };

    // 1. Load jQuery first
    const jqueryScript = loadScript(
      'https://code.jquery.com/jquery-3.7.1.min.js',
      // 2. Once jQuery loads, load chessboard.js
      () => {
        loadScript(
          'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js',
          () => {
            setChessboardLoaded(true); // Set loaded to true only after both scripts are ready
          }
        );
      }
    );

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js';
    script.onload = () => {
      setChessboardLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load ChessboardJS');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (link.parentNode) link.parentNode.removeChild(link);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // Load data and favorites
  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('chess-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load openings data
    fetch(`${process.env.PUBLIC_URL}/openings.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch openings data');
        return res.json();
      })
      .then(data => {
        console.log('Loaded openings:', data.length);
        setOpenings(data);
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
    let filtered = openings;

    // Apply ECO filter
    if (activeFilter === 'fav') {
      filtered = openings.filter(opening => favorites.includes(opening.eco));
    } else if (activeFilter !== 'all') {
      filtered = openings.filter(opening => opening.eco.startsWith(activeFilter));
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opening =>
        opening.name.toLowerCase().includes(query) ||
        opening.eco.toLowerCase().includes(query) ||
        opening.pgn.toLowerCase().includes(query)
      );
    }

    setFilteredOpenings(filtered);
  }, [openings, activeFilter, searchQuery, favorites]);

  // Calculate counts for filter tabs
  const counts = useMemo(() => ({
    all: openings.length,
    A: openings.filter(o => o.eco.startsWith('A')).length,
    B: openings.filter(o => o.eco.startsWith('B')).length,
    C: openings.filter(o => o.eco.startsWith('C')).length,
    D: openings.filter(o => o.eco.startsWith('D')).length,
    E: openings.filter(o => o.eco.startsWith('E')).length,
    fav: favorites.length
  }), [openings, favorites]);

  const toggleFavorite = (eco) => {
    setFavorites(prev => 
      prev.includes(eco) 
        ? prev.filter(fav => fav !== eco)
        : [...prev, eco]
    );
  };

  if (loading || !chessboardLoaded) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading chess openings...</p>
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
          onBack={() => setSelectedOpening(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.includes(selectedOpening.eco)}
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
              placeholder="Search openings by name, moves, or ECO code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <FilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />

        <section className="openings-section">
          <h2 className="section-title">
            {activeFilter === 'all' ? 'All Openings' : 
             activeFilter === 'fav' ? 'Your Favorites' : 
             `ECO ${activeFilter} Openings`} ({filteredOpenings.length})
          </h2>

          {filteredOpenings.length === 0 ? (
            <div className="no-results">
              <p>No openings found matching your criteria.</p>
            </div>
          ) : (
            <div className="openings-grid">
              {filteredOpenings.map(opening => (
                <OpeningCard
                  key={opening.eco}
                  opening={opening}
                  onSelect={setSelectedOpening}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(opening.eco)}
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