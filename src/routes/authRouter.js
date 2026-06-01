import { Router } from 'express';
import { register, login, listUsers } from '../controllers/authController.js'; // Ajuste o caminho se necessário

const router = Router();

// Define as rotas específicas de autenticação
router.post('/register', register);
router.post('/login', login);
router.get('/users', listUsers)

export default router;