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

export const findReviewByUser = async (req, res) => {
  try {
    const {userId} = req.params

    if(!userId) return res.status(404).json({message: "Erro ao ler id."})

    const reviews = await ReviewModel.findByUser(userId)

    if (!reviews || reviews.length === 0) {
      return res.status(200).json([]);
    }

    let moviesList = []

    try {
      const moviePromises = reviews.map(async (review) => {
        const mv = await getMovieById(review.tmdbId);
        
        // Return the combined object layout directly
        return {
          reviewId: review._id,
          rating: review.rating,
          content: review.content,
          createdAt: review.createdAt,
          movie: {
            title: mv.title,
            posterPath: mv.poster_path,
            releaseDate: mv.release_date,
            tagline: mv.tagline
          }
        };
      });

      // 2. Await all of them to resolve in parallel cleanly
      moviesList = await Promise.all(moviePromises);
    } catch(err) {
      console.warn(`⚠️ Continuous execution without TMDb details for user ${userId}:`, err.message);
      // Fallback: If TMDb breaks, return the reviews without breaking the page layout
      moviesList = reviews.map(review => ({
        reviewId: review._id,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
        movie: null
      }));
    }

    return res.status(200).json(moviesList);

  } catch(err) {
    console.error("Error!", err)
    return res.status(500).json({error: "Internal server error"})
  }
}

export const deleteReviewById = async (req, res) => {
  try {
    const {id} = req.params

    if(!id) return res.status(404).json({message: "Erro ao ler id."})

    try {
      const result = await ReviewModel.deleteReviewById(id);

      if (!result || result.deletedCount === 0) {
        return res.status(404).json({ error: "Review not found or already deleted." });
      }

      return res.status(200).json({ message: "Review successfully deleted." });
    } catch (err) {
      // 💡 Fixed log: Changed from a TMDb warning to an explicit database error log
      console.error(`❌ Database error while deleting review ${id}:`, err);
      return res.status(500).json({ error: "Failed to communicate with database." });
    }
  } catch(err) {
    console.error("Error!", err)
    return res.status(500).json({ error: "Internal server error" });
  }
}