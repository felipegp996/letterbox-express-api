import {Router} from "express"
import {getMoviesTrending, getPeopleTrending} from "../controllers/trendingController.js"

const router = Router()

router.get("/movies", getMoviesTrending)
router.get("/people", getPeopleTrending)

export default router