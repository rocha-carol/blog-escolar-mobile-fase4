import { Usuario } from "../models/Usuario.js";
import bcrypt from "bcryptjs";

// Middleware para validar professor via email e senha
async function validarProfessor(req, res, next) {
  try {
    const email = req.body.email || req.headers["x-email"] || req.query.email;
    const senha = req.body.senha || req.headers["x-senha"] || req.query.senha;

    if (!email || !senha) {
      return res.status(401).json({ message: "Usuário não cadastrado ou senha incorreta" });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: "Usuário não cadastrado ou senha incorreta" });
    }

    if (usuario.role !== "professor") {
      return res.status(403).json({ message: "Acesso restrito a professores" });
    }

    req.usuario = {
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    };
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export { validarProfessor };
