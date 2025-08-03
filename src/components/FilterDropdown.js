// components/FilterDropdown.js
import React, { useState, useEffect, useRef } from 'react';

const FilterDropdown = ({ activeFilter, onFilterChange, counts, userRepertoires = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // *** CHANGE #3: ADD "POPULAR OPENINGS" TO THE FILTERS ARRAY ***
  const filters = [
    { key: 'all', label: 'All Openings', count: counts.all },
    { key: 'popular', label: 'Popular Openings', count: counts.popular },
    { key: 'A', label: 'ECO A - Flank & Irregular', count: counts.A },
    { key: 'B', label: 'ECO B - Semi-Open', count: counts.B },
    { key: 'C', label: 'ECO C - Open Games', count: counts.C },
    { key: 'D', label: 'ECO D - Closed Games', count: counts.D },
    { key: 'E', label: 'ECO E - Indian Defenses', count: counts.E }
  ];

  const getFilterLabel = (filter) => {
    // Check if it's a repertoire
    const repertoire = userRepertoires.find(rep => rep.id === filter);
    if (repertoire) {
      return `${repertoire.name} (${counts[filter] || 0})`;
    }

    // Check standard filters
    const standardFilter = filters.find(f => f.key === filter);
    if (standardFilter) {
      return `${standardFilter.label} (${standardFilter.count})`;
    }

    return filter;
  };

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
          {getFilterLabel(activeFilter)}
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

          {userRepertoires.length > 0 && (
            <>
              <div className="dropdown-divider">My Repertoires</div>
              {userRepertoires.map(repertoire => (
                <button
                  key={repertoire.id}
                  onClick={() => handleFilterSelect(repertoire.id)}
                  className={`filter-dropdown-item ${activeFilter === repertoire.id ? 'active' : ''}`}
                >
                  <span className="filter-item-label">{repertoire.name}</span>
                  <span className="filter-item-count">({counts[repertoire.id] || 0})</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
