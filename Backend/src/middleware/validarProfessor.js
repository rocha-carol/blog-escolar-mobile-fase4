import { Usuario } from "../models/Usuario.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Middleware para validar professor via JWT
async function validarProfessor(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token não fornecido" });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "segredo_super_secreto");
    } catch (err) {
      return res.status(401).json({ message: "Token inválido" });
    }
    // Verifica se é professor
    if (decoded.role !== "professor") {
      return res.status(403).json({ message: "Acesso restrito a professores" });
    }
    // Adiciona dados do usuário na requisição
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export { validarProfessor };