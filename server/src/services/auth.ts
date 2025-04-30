import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id};
  const secretKey = process.env.JWT_SECRET_KEY || '';
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

export const getUserFromToken = (authHeader?: string): JwtPayload | null => {
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const secretKey = process.env.JWT_SECRET_KEY || '';
    return jwt.verify(token, secretKey) as JwtPayload;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}