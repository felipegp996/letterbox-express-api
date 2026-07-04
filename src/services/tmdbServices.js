// src/services/tmdbService.js
const TMDB_API_URL = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';
const TMDB_READ_ACCESS_KEY = process.env.TMDB_READ_ACCESS_KEY;

// Dynamic request configuration helper
const getOptions = (method = 'GET') => ({
  method,
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_READ_ACCESS_KEY}` // ✅ Fixed typo "Authorizarion"
  }
});

/**
 * Fetch detailed movie data by its TMDb ID
 */
export const getMovieById = async (movieId) => {
  try {
    // ✅ Fixed URL syntax: changed ".../movie/${movieId}/language=en-US" to "?language=en-US"
    const response = await fetch(`${TMDB_API_URL}/movie/${movieId}?language=en-US`, getOptions());

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`❌ Failed to fetch movie (${movieId}) from TMDb:`, err.message);
    throw err;
  }
};

/**
 * Global search helper (Essential for movie lookup bars)
 */
export const searchMovies = async (query, page = 1) => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `${TMDB_API_URL}/search/movie?query=${encodedQuery}&include_adult=false&language=en-US&page=${page}`,
      getOptions()
    );

    if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(`❌ Global TMDb Search failed for "${query}":`, err.message);
    throw err;
  }
};