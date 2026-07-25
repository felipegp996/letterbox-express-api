import {Router} from "express"
import {searchExternalMovies, getMovie} from "../controllers/movieController.js"

const router = Router()

router.get('/search', searchExternalMovies)
router.get('/:id', getMovie)

export default router