import {Router} from "express"
import {requireAuth} from "../middleware/authMiddleware.js"
import {createList} from "../controllers/listController.js"

const router = Router()

router.post("/create", requireAuth, createList)

export default router