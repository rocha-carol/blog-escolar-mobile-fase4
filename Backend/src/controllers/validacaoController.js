import bcrypt from "bcryptjs";
import { Usuario } from "../models/Usuario.js";

class ValidacaoController {
    // Registrar usuário  
    static async cadastrarUsuario(req, res) {
        try {
            const { nome, email, senha, role } = req.body;

            const hashedSenha = await bcrypt.hash(senha, 10);
            const novoUsuario = await Usuario.create({ nome, email, senha: hashedSenha, role });

            res.status(201).json({
                message: "Usuário registrado com sucesso",
                Usuario: novoUsuario
            });

        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({ message: "Email já cadastrado" });
            }
            return res.status(400).json({ message: `${err.message} - Falha ao registrar usuario` });
        }
    }
    // Login (gera o token JWT)
    static async login(req, res) {
        try {
            const { email, senha } = req.body;

            // Verifica se email e senha foram enviados
            if (!email || !senha) return res.status(400).json({ message: "Email e senha são obrigatórios" });

            const usuarioCadastrado = await Usuario.findOne({ email });
            if (!usuarioCadastrado) return res.status(400).json({ message: "Usuário não encontrado" });

            const senhaCorreta = await bcrypt.compare(senha, usuarioCadastrado.senha);
            if (!senhaCorreta) return res.status(400).json({ message: "Senha inválida" });

            // Retorna o token e os dados do usuário
            return res.status(200).json({
                message: "Login realizado",
                usuario: {
                    id: usuarioCadastrado._id,
                    nome: usuarioCadastrado.nome,
                    email: usuarioCadastrado.email,
                    role: usuarioCadastrado.role
                }
            });

        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
};

export default ValidacaoController;
