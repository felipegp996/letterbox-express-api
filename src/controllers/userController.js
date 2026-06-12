import { prisma } from '../config/db.js'; 
import bcrypt from 'bcryptjs';

export const createUser = async (req, res) => {
	try {
    const { email, password, role, name } = req.body;

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
        role: role,
        name: name
      },
    });

    return res.status(201).json({
      message: 'Usuário criado com sucesso!',
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
    });

  } catch (error) {
    // Esse log no terminal vai te salvar se o banco rejeitar o insert por outro motivo
    console.error("❌ Erro detalhado no registro:", error); 
    return res.status(500).json({ error: "Erro interno no servidor: " + error.message });
  }
}

export const updateUser = async (req, res) => {
  try{
    const {id, name, role, email} = req.body

    if(!id) return res.status(404).json({error: "Usuário inexistente"})

  const user = await prisma.user.update({
    where: {id},
    data: {name: name, role: role, email: email}
  })

  return res.status(201).json({message: "Usuário atualizado com sucesso!", user: user})
  } catch (error) {
    console.error("❌ Erro detalhado no registro:", error)
    return res.status(500).json({error: "Erro interno no servidor: " + error.message})
  }

}

export const deleteUser = async (req, res) => {
	try {
		const { id } = req.body

		if(!id) return res.status(404).json({error: "Usuário inexistente."})

		await prisma.user.delete({
			where: { id }
		})

		return res.status(201).json({message: "Usuário excluído com sucesso"})
	} catch (error) {
		console.error("❌ Erro detalhado no registro:", error)
		return res.status(500).json({error: "Erro interno no servidor: " + error.message})
	}
}

export const findUserById = async (req, res) => {
  try {
    const {id} = req.body

    if(!id) return res.status(400).json({message: "Erro ao ler id."})

    const user = await prisma.user.findUnique({
      where: {id}
    })

    if(!user) return res.status(404).json({message: "usuário não encontrado."})

    return res.status(200).json({user: user})
  } catch (error) {
    console.error("❌ Erro detalhado no registro:", error)
    return res.status(500).json({error: "Erro interno no servidor: " + error.message})
  }
}

export const listAllUsers = async (req, res) => {
  try {
    const users = await prisma.findMany()
  
    if(!users) return res.status(404).json({message: "Não há usuários cadastrados."})

    return res.status(200).json({users: users})
  } catch (error) {
    console.error("❌ Erro detalhado no registro:", error)
    return res.status(500).json({error: "Erro interno no servidor: " + error.message})
  }
}