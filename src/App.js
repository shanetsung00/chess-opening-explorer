import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './utils/firebase';
import { 
  createUserDocument, 
  migrateFavoritesToRepertoire,
  removeOpeningFromRepertoire
} from './utils/authUtils';
import { loadFavorites, clearFavorites, isMigrationCompleted } from './utils/storageUtils';

import './App.css';
import './styles/moveNavigation.css';

import OpeningCard from './components/OpeningCard';
import DetailView from './components/DetailView';
import FilterDropdown from './components/FilterDropdown';
import VirtualizedGrid from './components/VirtualizedGrid';
import AuthModal from './components/AuthModal';
import RepertoireManager from './components/RepertoireManager';
import RepertoireSelector from './components/RepertoireSelector';
import UserMenu from './components/UserMenu';
import { SearchIcon } from './components/Icons';
import { searchInOpening } from './utils/searchUtils';

const App = () => {
  const [openings, setOpenings] = useState([]);
  const [filteredOpenings, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOpening, setSelectedOpening] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boardReady, setBoardReady] = useState(false);
  
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRepertoireManager, setShowRepertoireManager] = useState(false);
  const [showRepertoireSelector, setShowRepertoireSelector] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (window.ChessBoard) { 
      setBoardReady(true); 
      return; 
    }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css';
    document.head.appendChild(css);
    const inject = (src, cb) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = cb;
      s.onerror = () => setError(`Failed to load ${src}`);
      document.head.appendChild(s);
    };
    inject('https://code.jquery.com/jquery-3.7.1.min.js', () =>
      inject(
        'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js',
        () => setBoardReady(true)
      )
    );
    return () => { css.remove(); };
  }, []);

  useEffect(() => {
    let unsubscribeAuth = null;
    let unsubscribeUser = null;
    const authTimeout = setTimeout(() => {
      if (authLoading) {
        console.warn('Auth initialization timeout');
        setAuthLoading(false);
      }
    }, 10000);

    unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          await createUserDocument(currentUser);
          const userRef = doc(db, 'users', currentUser.uid);
          unsubscribeUser = onSnapshot(userRef, (doc) => {
            setUserData(doc.exists() ? doc.data() : null);
          }, (err) => {
            console.error('User data listener error:', err);
            setUserData(null);
          });
          if (!isMigrationCompleted()) {
            const storedFavorites = loadFavorites();
            if (storedFavorites.length > 0) {
              await migrateFavoritesToRepertoire(currentUser.uid, storedFavorites);
            }
            clearFavorites();
          }
        } catch (err) {
          console.error('User setup error:', err);
        }
      } else {
        if (unsubscribeUser) unsubscribeUser();
        setUserData(null);
      }
      setAuthLoading(false);
    }, (err) => {
      console.error('Auth error:', err);
      setAuthLoading(false);
    });

    return () => {
      clearTimeout(authTimeout);
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
    // -> eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const idxRes = await fetch(`${process.env.PUBLIC_URL}/openings/band-sizes.json`);
        if (!idxRes.ok) throw new Error('band-sizes.json missing');
        const letters = Object.keys(await idxRes.json());
        const parts = await Promise.all(
          letters.map(l =>
            fetch(`${process.env.PUBLIC_URL}/openings/openings-${l}.json`)
              .then(r => (r.ok ? r.json() : Promise.reject(`openings-${l}.json missing`)))
          )
        );
        if (cancelled) return;
        const combined = parts.flat().map((o, i) => ({ ...o, uniqueId: `${o.eco || 'XX'}-${i}` }));
        setOpenings(combined);
      } catch (e) {
        if (!cancelled) setError(e.toString());
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let list = [...openings];
    if (activeFilter.startsWith('repertoire_')) {
      const repertoire = userData?.repertoires.find(r => r.id === activeFilter);
      list = repertoire ? list.filter(o => repertoire.openings.includes(o.uniqueId)) : [];
    } else if ('ABCDE'.includes(activeFilter)) {
      list = list.filter(o => o.eco?.startsWith(activeFilter));
    }
    if (searchQuery.trim()) {
      list = list.filter(o => searchInOpening(o, searchQuery.trim()));
    }
    setFiltered(list);
  }, [openings, activeFilter, searchQuery, userData]);

  const getCurrentRepertoire = () => {
    return userData?.repertoires?.find(rep => rep.id === activeFilter) || null;
  };

  const isOpeningInAnyRepertoire = (openingId) => {
    return userData?.repertoires?.some(rep => rep.openings.includes(openingId)) || false;
  };

  const handleAddToRepertoire = async (opening) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const currentRepertoire = getCurrentRepertoire();
    if (currentRepertoire && currentRepertoire.openings.includes(opening.uniqueId)) {
      await removeOpeningFromRepertoire(user.uid, currentRepertoire.id, opening.uniqueId).catch(err => console.error(err));
    } else {
      setShowRepertoireSelector(opening);
    }
  };

  const handleViewRepertoire = (repertoire) => {
    setActiveFilter(repertoire.id);
    setShowRepertoireManager(false);
  };

  const counts = useMemo(() => {
    const by = l => openings.filter(o => o.eco?.startsWith(l)).length;
    const baseCounts = { all: openings.length, A: by('A'), B: by('B'), C: by('C'), D: by('D'), E: by('E') };
    userData?.repertoires?.forEach(rep => {
      baseCounts[rep.id] = rep.openings.length;
    });
    return baseCounts;
  }, [openings, userData]);

  const refreshUserData = () => {};

  if ((loading && openings.length === 0) || !boardReady || (authLoading && !user && userData === null)) {
    return <div className="loading">Loading…</div>;
  }
  
  if (error) {
    return <div className="loading">Error: {error}</div>;
  }

  return (
    <div className="app">
      <UserMenu 
        user={user}
        onManageRepertoires={() => setShowRepertoireManager(true)}
        onSignOut={() => auth.signOut()}
        onSignIn={() => setShowAuthModal(true)}
      />
      
      {selectedOpening ? (
        <DetailView
          opening={selectedOpening}
          onBack={() => setSelectedOpening(null)}
          onToggleFavorite={handleAddToRepertoire}
          isFavorite={isOpeningInAnyRepertoire(selectedOpening.uniqueId)}
          user={user}
        />
      ) : (
        <>
          <header className="app-header">
            <div className="header-top">
              <div className="title-section">
                <h1 className="app-title">Chess Opening Explorer</h1>
                <p className="app-subtitle">Interactive Chess Opening Database</p>
              </div>
            </div>
            <div className="search-section">
              <div className="search-bar">
                <SearchIcon />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search openings, moves (e.g '1.e4'), ECO codes…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="controls-row">
                <FilterDropdown
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  counts={counts}
                  userRepertoires={userData?.repertoires || []}
                />
              </div>
            </div>
          </header>
          <main className="main-content">
            <VirtualizedGrid
              items={filteredOpenings || []}
              columnWidth={320}
              rowHeight={560}
              maxColumns={3}
              overscan={2}
              renderItem={(opening) => (
                <OpeningCard
                  key={opening.uniqueId}
                  opening={opening}
                  onSelect={setSelectedOpening}
                  onAddToRepertoire={handleAddToRepertoire}
                  isInAnyRepertoire={isOpeningInAnyRepertoire(opening.uniqueId)}
                  user={user}
                  currentRepertoire={getCurrentRepertoire()}
                />
              )}
            />
          </main>
        </>
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showRepertoireManager && (
        <div className="panel-overlay" onClick={() => setShowRepertoireManager(false)}>
          <div className="repertoire-panel" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <h2>Manage Repertoires</h2>
              <button 
                className="panel-close-btn" 
                onClick={() => setShowRepertoireManager(false)}
                title="Close"
              >
                &times;
              </button>
            </div>
            <div className="panel-content">
              <RepertoireManager
                user={user}
                userRepertoires={userData?.repertoires || []}
                onRepertoireUpdate={refreshUserData}
                onViewRepertoire={handleViewRepertoire}
              />
            </div>
          </div>
        </div>
      )}

      {showRepertoireSelector && (
        <RepertoireSelector
          user={user}
          userData={userData}
          opening={showRepertoireSelector}
          onClose={() => setShowRepertoireSelector(null)}
          onUpdate={refreshUserData}
        />
      )}
    </div>
  );
};

export default App;