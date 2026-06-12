import { Router } from "express"
import { createUser, deleteUser, updateUser } from "../controllers/userController.js"
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js"

const router = Router()

router.post("/createUser", requireAuth, requireAdmin, createUser)
router.delete("/deleteUser", requireAuth, requireAdmin, deleteUser)
router.post("/updateUser", requireAuth, requireAdmin, updateUser)

export default router