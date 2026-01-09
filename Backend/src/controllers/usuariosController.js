import bcrypt from "bcryptjs";
import { Usuario } from "../models/Usuario.js";

class UsuariosController {
  static async listarUsuarios(req, res) {
    try {
      const { role, page = 1, limit = 10 } = req.query;
      const filtro = role ? { role } : {};
      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
      const skip = (pageNumber - 1) * limitNumber;

      const [usuarios, total] = await Promise.all([
        Usuario.find(filtro).select("-senha").skip(skip).limit(limitNumber).sort({ nome: 1 }),
        Usuario.countDocuments(filtro),
      ]);

      return res.status(200).json({
        usuarios: usuarios.map((usuario) => ({
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
        })),
        total,
        page: pageNumber,
        limit: limitNumber,
        hasMore: skip + usuarios.length < total,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async obterUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findById(id).select("-senha");
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      return res.status(200).json({
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async atualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, senha, role } = req.body;

      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      if (nome) usuario.nome = nome;
      if (email) usuario.email = email;
      if (role) usuario.role = role;
      if (senha) {
        usuario.senha = await bcrypt.hash(senha, 10);
      }

      await usuario.save();

      return res.status(200).json({
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
        },
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: "Email já cadastrado" });
      }
      return res.status(500).json({ message: err.message });
    }
  }

  static async excluirUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByIdAndDelete(id);
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      return res.status(200).json({ message: "Usuário removido com sucesso" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default UsuariosController;
