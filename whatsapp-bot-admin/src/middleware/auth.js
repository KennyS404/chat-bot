export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  // Validação simples do token (em produção, use JWT)
  const validToken = Buffer.from(`${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`).toString('base64');
  
  if (token !== validToken) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  next();
}; 