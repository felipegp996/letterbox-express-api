import { ReviewModel } from '../models/reviewModel.js';
import { getMovieById } from '../services/tmdbServices.js'

export const createReview = async (req, res) => {
  try {
    // req.user.id comes from your existing auth middleware via PostgreSQL
    const { tmdbId, rating, content } = req.body;
    
    const result = await ReviewModel.create({
      userId: req.user.userId, 
      tmdbId,
      rating,
      content
    });

    return res.status(201).json({ message: "Review created", reviewId: result.insertedId });
  } catch (err) {
    if (err.code === 11000) { // MongoDB duplicate key error code
      return res.status(400).json({ error: "You have already reviewed this movie." });
    }
    console.error("Error!", err)
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const findReviewById = async (req, res) => {
  try {
    const {id} =  req.params

    if(!id) return res.status(404).json({message: "Erro ao ler id."})

    const review = await ReviewModel.findById(id)

    let movieData = null
    try {
      const movie = await getMovieById(review.tmdbId);
      
      movieData = {
        title: movie.title,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
        tagline: movie.tagline
      };
    } catch (tmdbError) {
      console.warn(`⚠️ Continuous execution without TMDb details for review ${id}`);
    }

    return res.status(200).json({
      id: review._id,
      userId: review.userId,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      movie: movieData
    });
    
  } catch (err) {
    console.error("Error!", err)
    return res.status(500).json({ error: "Internal server error" });
  }
}
