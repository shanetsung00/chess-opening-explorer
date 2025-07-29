import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// Chess piece Unicode symbols
const PIECES = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Convert FEN to board array
const fenToBoard = (fen) => {
  if (!fen) return Array(8).fill().map(() => Array(8).fill(''));
  
  const position = fen.split(' ')[0];
  const rows = position.split('/');
  const board = [];
  
  for (let i = 0; i < 8; i++) {
    const row = [];
    const rowData = rows[i];
    
    for (let char of rowData) {
      if (isNaN(char)) {
        row.push(char);
      } else {
        for (let j = 0; j < parseInt(char); j++) {
          row.push('');
        }
      }
    }
    board.push(row);
  }
  
  return board;
};

// Simple Chess Board Component
const SimpleChessBoard = ({ fen, size = 280 }) => {
  const board = fenToBoard(fen);
  const squareSize = size / 8;
  
  return (
    <div 
      className="chess-board" 
      style={{ 
        width: size, 
        height: size,
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        border: '2px solid #8B4513',
        borderRadius: '4px'
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const isLight = (rowIndex + colIndex) % 2 === 0;
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: squareSize,
                height: squareSize,
                backgroundColor: isLight ? '#FFCE9E' : '#D18B47',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: squareSize * 0.7,
                fontWeight: 'bold'
              }}
            >
              {PIECES[piece] || ''}
            </div>
          );
        })
      )}
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
      <SimpleChessBoard fen={opening.fen} size={260} />
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

// Detail View Component
const DetailView = ({ opening, onBack, onToggleFavorite, isFavorite }) => (
  <div className="detail-view">
    <header className="detail-header">
      <button onClick={onBack} className="back-btn">
        <ArrowLeftIcon />
        Back to All Openings
      </button>
    </header>
    
    <main className="detail-content">
      <div className="detail-info">
        <h1 className="detail-title">{opening.name}</h1>
        <p className="detail-moves">{opening.pgn}</p>
        <div className="detail-meta">
          <span className="detail-eco">{opening.eco}</span>
        </div>
      </div>
      
      <div className="detail-board-section">
        <SimpleChessBoard fen={opening.fen} size={400} />
        <button 
          onClick={() => onToggleFavorite(opening.eco)} 
          className="detail-favorite-btn"
        >
          <StarIcon isFavorite={isFavorite} />
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      </div>
    </main>
  </div>
);

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

  // Load data and favorites
  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('chess-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load openings data
    fetch('./openings.json')
      .then(res => res.json())
      .then(data => {
        setOpenings(data);
        setLoading(false);
      })
      .catch(err => {
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

  if (loading) {
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