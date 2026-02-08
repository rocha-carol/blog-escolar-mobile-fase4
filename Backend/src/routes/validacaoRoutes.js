import express from "express";
import validacaoController from "../controllers/validacaoController.js";

const validacaoRoutes = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UsuarioRegistro:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - role
 *       properties:
 *         nome:
 *           type: string
 *           example: Nome do Usuário
 *         email:
 *           type: string
 *           example: usuario@email.com
 *         senha:
 *           type: string
 *           example: 123456
 *         role: 
 *           type: string
 *           example: professor
 *     UsuarioLogin:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           example: usuario@email.com
 *         senha:
 *           type: string
 *           example: 123456
 */

/**
 * @swagger
 * /usuario/registro:
 *   post:
 *     summary: Cadastro de usuário
 *     tags: [usuario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioRegistro'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos ou usuário já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dados inválidos ou usuário já cadastrado
 */
validacaoRoutes.post("/registro", validacaoController.cadastrarUsuario);

/**
 * @swagger
 * /usuario/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [usuario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioLogin'
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login bem-sucedido
 *       401:
 *         description: Email ou senha incorretos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email ou senha incorretos
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dados inválidos
 */
validacaoRoutes.post("/login", validacaoController.login);

/**
 * @swagger
 * /usuario/login-aluno:
 *   post:
 *     summary: Login de aluno (RM + nome)
 *     tags: [usuario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - rm
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Nome do Aluno
 *               rm:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login de aluno bem-sucedido
 *       401:
 *         description: Aluno não encontrado ou dados inválidos
 */
validacaoRoutes.post("/login-aluno", validacaoController.loginAluno);

export default validacaoRoutes;