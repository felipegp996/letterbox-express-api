import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Verifica se o cabeçalho Authorization foi enviado
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  // 2. Extrai o token de dentro da string "Bearer <TOKEN>"
  const token = authHeader.split(' ')[1];

  try {
    // 3. Valida o token usando a chave secreta do seu .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Injeta os dados do usuário decodificados dentro do objeto 'req'
    // Assim, qualquer rota protegida que vier depois terá acesso a req.user.userId
    req.user = decoded;

    // 5. Tudo certo! Segue para a rota desejada
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};

export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Verifica se o cabeçalho Authorization foi enviado
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  // 2. Extrai o token de dentro da string "Bearer <TOKEN>"
  const token = authHeader.split(' ')[1];

  try {
    // 3. Valida o token usando a chave secreta do seu .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Injeta os dados do usuário decodificados dentro do objeto 'req'
    // Assim, qualquer rota protegida que vier depois terá acesso a req.user.userId
    req.user = decoded;

    // 5. Tudo certo! Segue para a rota desejada
    if(req.user.role === "admin"){
      next();      
    } else {
      return res.status(403).json({ error: 'Rota bloqueada, apenas administradores tem permissão para essa ação' })
    }
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
}