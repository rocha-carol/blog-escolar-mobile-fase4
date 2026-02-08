import bcrypt from "bcryptjs";
import { Usuario } from "../models/Usuario.js";

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

class ValidacaoController {
    // Registrar usuário  
    static async cadastrarUsuario(req, res) {
        try {
            const { nome, email, senha, role } = req.body;

            if (!nome || !email || !senha || !role) {
                return res.status(400).json({ message: "nome, email, senha e role são obrigatórios" });
            }

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

            // Primeiro acesso: professor cadastrado sem senha define a senha aqui
            if (usuarioCadastrado.primeiroAcesso || !usuarioCadastrado.senha) {
                const hashedSenha = await bcrypt.hash(senha, 10);
                usuarioCadastrado.senha = hashedSenha;
                usuarioCadastrado.primeiroAcesso = false;
                await usuarioCadastrado.save();

                return res.status(200).json({
                    message: "Senha criada no primeiro acesso. Login realizado",
                    firstAccess: true,
                    usuario: {
                        id: usuarioCadastrado._id,
                        nome: usuarioCadastrado.nome,
                        email: usuarioCadastrado.email,
                        role: usuarioCadastrado.role
                    }
                });
            }

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

    // Login de aluno (RM + Nome) - sem senha
    static async loginAluno(req, res) {
        try {
            const { nome, rm } = req.body;

            if (!nome || !rm) {
                return res.status(400).json({ message: "Nome e RM são obrigatórios" });
            }

            const rmTrim = String(rm).trim();
            const aluno = await Usuario.findOne({ rm: rmTrim });

            if (!aluno || aluno.role !== "aluno") {
                return res.status(401).json({ message: "Aluno não encontrado" });
            }

            const nomeOk = normalizeText(aluno.nome) === normalizeText(nome);
            if (!nomeOk) {
                return res.status(401).json({ message: "Nome ou RM inválidos" });
            }

            return res.status(200).json({
                message: "Login de aluno realizado",
                usuario: {
                    id: aluno._id,
                    nome: aluno.nome,
                    rm: aluno.rm,
                    role: "aluno",
                },
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
};

export default ValidacaoController;
