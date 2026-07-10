import {Router} from "express"
import {requireAuth} from "../middleware/authMiddleware.js"
import {
	createList, 
	addMovieToList, 
	deleteMovieFromList, 
	updateListDetails, 
	deleteList, 
	getUserLists, 
	getListById
} from "../controllers/listController.js"

const router = Router()

// 1. Base List Actions
router.post("/", requireAuth, createList);                  // POST /api/lists (Creates a list)
router.put("/:id", requireAuth, updateListDetails);         // PUT /api/lists/:id (Updates details)
router.delete("/:id", requireAuth, deleteList);             // DELETE /api/lists/:id (Deletes entire list)

// 2. Nested Movie Resource Actions inside a List
router.post("/:id/movies", requireAuth, addMovieToList);     // POST /api/lists/:id/movies (Adds a movie)
router.delete("/:id/movies/:tmdbId", requireAuth, deleteMovieFromList); // DELETE /api/lists/:id/movies/:tmdbId (Removes a movie)

// 3. User-Specific Queries
router.get("/user/:userId", getUserLists);                  // GET /api/lists/user/:userId (Fetches a user's lists)
router.get("/:id", getListById); 							// GET /api/lists/:id (Fetches a single list)

export default router