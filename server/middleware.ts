import { Request, Response, NextFunction } from "express";

export function checkAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username === 'gilduck' && password === 'gilduck') {
    next();
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
}
