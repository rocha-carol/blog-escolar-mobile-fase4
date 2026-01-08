import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

class ValidacaoController {
    // Registrar usuário  
    static async cadastrarUsuario(req, res) {
        try {
            const { nome, email, senha, role } = req.body;
            if (!nome || !email || !senha) {
                return res.status(400).json({ message: "Nome, email e senha são obrigatórios" });
            }
            if (!EMAIL_REGEX.test(email)) {
                return res.status(400).json({ message: "Email inválido" });
            }
            if (senha.length < MIN_PASSWORD_LENGTH) {
                return res.status(400).json({ message: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` });
            }

            const hashedSenha = await bcrypt.hash(senha, 10);
            const novoUsuario = await Usuario.create({ nome, email, senha: hashedSenha, role });

            res.status(201).json({
                message: "Usuário registrado com sucesso",
                usuario: {
                    id: novoUsuario._id,
                    nome: novoUsuario.nome,
                    email: novoUsuario.email,
                    role: novoUsuario.role
                }
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

            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                return res.status(500).json({ message: "JWT_SECRET não configurado" });
            }

            // Gerar token JWT
            const token = jwt.sign(
                {
                    id: usuarioCadastrado._id,
                    nome: usuarioCadastrado.nome,
                    email: usuarioCadastrado.email,
                    role: usuarioCadastrado.role
                },
                jwtSecret,
                { expiresIn: "1d" }
            );

            // Retorna o token e os dados do usuário
            return res.status(200).json({
                token,
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
