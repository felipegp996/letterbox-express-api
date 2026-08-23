import { Router } from "express"
import { createUser, deleteUser, updateUser, updateMyUser } from "../controllers/userController.js"
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js"

const router = Router()

router.post("/createUser", createUser)
router.delete("/deleteUser", requireAuth, requireAdmin, deleteUser)
router.post("/updateUser", requireAuth, requireAdmin, updateUser)
router.post("/updateMyUser", requireAuth, updateMyUser)

export default router