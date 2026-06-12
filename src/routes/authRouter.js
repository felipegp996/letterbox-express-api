import { Router } from 'express';
import { login } from '../controllers/authController.js'; // Ajuste o caminho se necessário

const router = Router();

// Define as rotas específicas de autenticação
router.post('/login', login);

export default router;