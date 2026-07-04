import {ObjectId} from "mongodb"
import {getMongoDb} from "../config/db.js"

// Best Practice: Setup indexes manually once on startup
export const initReviewIndexes = async () => {
  const collection = getMongoDb().collection("reviews")
  // Speed up lookups for users or specific movies
  await collection.createIndex({ userId: 1 });
  await collection.createIndex({ tmdbId: 1 });
  // Enforce one review per movie, per user
  await collection.createIndex({ userId: 1, tmdbId: 1 }, { unique: true });
};

export const ReviewModel = {
	create: async (reviewData) => {
		const review = {
			userId: reviewData.userId,
			tmdbId: Number(reviewData.tmdbId),
			rating: parseFloat(reviewData.rating),
			conent: reviewData.content?.trim() || "",
			createdAt: new Date(),
			updatedAt: new Date()
		}

		return await getMongoDb().collection('reviews').insertOne(review)
	},

	findById: async (id) => {
		return await getMongoDb().collection('reviews').findOne({_id: new ObjectId(id)})
	},

	findByUser: async (userId) => {
		return await getMongoDb().collection('reviews').find({userId}).toArray()
	}
}