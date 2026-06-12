import express from "express"
import {requireAuth} from "./middleware/authMiddleware.js"
import authRouter from "./routes/authRouter.js"
import userRouter from "./routes/userRouter.js"

const app = express();
const port = 3000;

app.use(express.json())
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// --- Rotas Privadas (Protegidas pelo Middleware) ---
app.get('/api/users/profile', requireAuth, (req, res) => {
  // Como o requireAuth rodou o 'next()', sabemos que o token é válido
  // e temos os dados do usuário disponíveis em req.user
  res.status(200).json({
    message: 'Você acessou uma rota protegida com sucesso!',
    user: req.user
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

