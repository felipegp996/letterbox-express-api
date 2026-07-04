import { ReviewModel } from '../models/reviewModel.js';

export const createReview = async (req, res) => {

  console.log("👤 Current req.user object:", req.user); 
  console.log("🆔 Extracted userId:", req.user?.id);
  console.log("👤 Current req object:", req); 

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
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error code
      return res.status(400).json({ error: "You have already reviewed this movie." });
    }
    console.error("Error!", error)
    return res.status(500).json({ error: "Internal server error" });
  }
};