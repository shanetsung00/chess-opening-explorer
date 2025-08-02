// utils/searchUtils.js

// Enhanced search function that includes move notation
export const searchInOpening = (opening, query) => {
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