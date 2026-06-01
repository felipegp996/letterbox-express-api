import { prisma } from '../config/db.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação simples
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // Criptografa a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salva no banco de dados usando o prisma conectado ao Neon
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: 'Usuário criado com sucesso!',
      user: { id: newUser.id, email: newUser.email }
    });

  } catch (error) {
    // Esse log no terminal vai te salvar se o banco rejeitar o insert por outro motivo
    console.error("❌ Erro detalhado no registro:", error); 
    return res.status(500).json({ error: "Erro interno no servidor: " + error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validação de campos obrigatórios
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // 2. Busca o usuário no banco pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Se o usuário não existir, retornamos um erro genérico por segurança
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // 3. Compara a senha recebida com o hash salvo no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // 4. Se chegou até aqui, as credenciais estão certas! Vamos gerar o Token JWT.
    // Usaremos uma string temporária como segredo caso não tenha no .env ainda
    const jwtSecret = process.env.JWT_SECRET

    const token = jwt.sign(
      { userId: user.id, email: user.email }, // Dados que vão guardados dentro do token (payload)
      jwtSecret,                             // Chave para assinar o token e garantir que ele não foi adulterado
      { expiresIn: '1d' }                    // Tempo de expiração (1 dia)
    );

    // 5. Retorna o sucesso e o token para o cliente
    return res.status(200).json({
      message: 'Login realizado com sucesso!',
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    console.error("❌ Erro detalhado no login:", error);
    return res.status(500).json({ error: "Erro interno no servidor: " + error.message });
  }
};

export const listUsers = async (req, res) => {
	try {
		const users = await prisma.user.findMany()

		if(!users) {
			return res.status(404).json({error: "Nenhum usuário na base"})
		}

		return res.status(200).json({
			message: "Busca concluída!",
			users: users
		})
	} catch(error) {
		console.error("❌ Erro detalhado na busca:", error);
    	return res.status(500).json({ error: "Erro interno no servidor: " + error.message });
	}
}