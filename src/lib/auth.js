import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret_development';

// Generar token JWT
export function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verificar token JWT
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// Hashear password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Comparar password
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Obtener token de cookies
export function getTokenFromCookies(req) {
  const cookies = req.headers.cookie || '';
  const tokenMatch = cookies.match(/token=([^;]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

// Middleware para verificar autenticación
export function authMiddleware(handler) {
  return async (req, res) => {
    const token = getTokenFromCookies(req);
    if (!token) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.userId = userId;
    return handler(req, res);
  };
}

// Obtener usuario desde el token (para server-side props)
export async function getUserFromToken(context) {
  const { req } = context;
  const token = getTokenFromCookies(req);
  if (!token) {
    return null;
  }
  const userId = verifyToken(token);
  if (!userId) {
    return null;
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}
