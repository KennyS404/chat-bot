import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    res.json({ 
      success: true, 
      token,
      user: { username }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Credenciais inválidas' 
    });
  }
});

authRouter.post('/logout', (req, res) => {
  res.json({ success: true });
}); 