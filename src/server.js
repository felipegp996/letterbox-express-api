import express from "express"
import cors from "cors"
import {requireAuth} from "./middleware/authMiddleware.js"
import { connectMongoDB } from "./config/db.js"
import authRouter from "./routes/authRouter.js"
import userRouter from "./routes/userRouter.js"
import reviewRouter from "./routes/reviewRouter.js"
import moviesRouter from "./routes/moviesRouter.js"
import listRouter from "./routes/listRouter.js"
import { initReviewIndexes } from './models/reviewModel.js';
import { initListIndexes } from './models/listModel.js';

const app = express();
const port = 3000;

app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:5173',
  ],
  credentials: true
}))
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api/movies", moviesRouter)
app.use("/api/lists", listRouter)

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

await connectMongoDB()

initReviewIndexes()
initListIndexes()

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

