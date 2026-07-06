import {searchMovies} from "../services/tmdbServices.js"

export const searchExternalMovies = async (req, res) => {
  try {
    const { query, page } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query parameter is required.' });
    }

    // Call your global TMDb service layer
    const data = await searchMovies(query, page || 1);

    // Sanitize the data so your front-end receives a clean, lightweight array
    const cleanMovies = data.results.map(movie => ({
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseYear: movie.release_date ? movie.release_date.split('-')[0] : null,
      overview: movie.overview
    }));

    return res.status(200).json({
      page: data.page,
      totalPages: data.total_pages,
      results: cleanMovies
    });

  } catch (error) {
    console.error('❌ Error proxying movie search:', error.message);
    return res.status(500).json({ error: 'Internal server error while searching movies.' });
  }
};