import {Router} from "express"
import {searchExternalMovies} from "../controllers/movieController.js"

const router = Router()

router.get('/search', searchExternalMovies)

export default router