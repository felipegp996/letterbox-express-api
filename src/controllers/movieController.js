import {searchMovies, getMovieById} from "../services/tmdbServices.js"

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

export const getMovie = async (req, res) => {
  try {
    const {id} = req.params

    if(!id) return res.status(400).json({error: 'Movie id is required.'})

    const data = await getMovieById(id)

    const cleanMovie = {
      tmdbId: data.id,
      title: data.title,
      posterPath: data.poster_path,
      releaseYear: data.release_date ? data.release_date.split('-')[0] : null,
      overview: data.overview
    }

    return res.status(200).json({
      result: cleanMovie
    })
  } catch (error) {
    console.error('❌ Error proxying movie search:', error.message);
    return res.status(500).json({ error: 'Internal server error while searching movies.' });
  }
}