import express from "express";
import PostsController from "../controllers/postController.js";
import { validarProfessor } from "../middleware/validarProfessor.js";
import uploadImagem from "../middleware/uploadImagem.js";

const postsRoutes = express.Router();

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
 *     Post:
 *       type: object
 *       required:
 *         - titulo
 *         - conteudo
 *         - areaDoConhecimento
 *       properties:
 *         id:
 *           type: string
 *           example: 670a12bd9b3e
 *         titulo:
 *           type: string
 *           example: Meu novo post
 *         conteudo:
 *           type: string
 *           example: Conteúdo do post
 *         areaDoConhecimento:
 *           type: string
 *           example: Tecnologias
 *         CriadoEm:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00Z
 *         AtualizadoEm:
 *           type: string
 *           format: date-time
 *           example: 2023-01-01T00:00:00Z
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Lista todas as postagens
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Lista de posts retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
postsRoutes.get("/", PostsController.listarPosts);

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Busca posts por palavra-chave
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           example: Meu
 *         required: true
 *         description: Texto a ser buscado em título ou conteúdo
 *     responses:
 *       200:
 *         description: Resultados da busca
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: Nenhum post encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nenhum post encontrado
 */
postsRoutes.get("/search", PostsController.buscarPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Retorna uma postagem específica
 *     tags: [Posts]
 *     operationId: getPostById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: teste
 *         description: busca por ID do post
 *     responses:
 *       200:
 *         description: Post encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post não encontrado
 */
postsRoutes.get("/:id", PostsController.lerPost);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Cria uma nova postagem
 *     description: Requer autenticação. Apenas usuários cadastrados como professores podem criar posts. Informe email e senha válidos.
 *     tags: [Acesso restrito - Professores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *         links:
 *           GetCreatedPost:
 *             operationId: getPostById
 *             parameters:
 *               id: "$response.body#/id"
 *             description: Retorna o post criado
 *       401:
 *         description: Usuário não cadastrado ou senha incorreta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário não cadastrado ou senha incorreta
 */
// Adiciona middleware de upload para tratar imagem
postsRoutes.post("/", validarProfessor, uploadImagem.single("imagem"), PostsController.criarPost);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Atualiza uma postagem existente
 *     description: Requer autenticação. Apenas usuários cadastrados como professores podem editar posts. Informe email e senha válidos.
 *     tags: [Acesso restrito - Professores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 670a12bd9b3e
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Usuário não cadastrado ou senha incorreta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário não cadastrado ou senha incorreta
 *       404:
 *         description: Post não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post não encontrado
 */
postsRoutes.put("/:id", validarProfessor, uploadImagem.single("imagem"), PostsController.editarPost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Exclui uma postagem existente
 *     description: Exclui o post pelo ID informado. Mostra o post correspondente ao ID antes da exclusão e retorna apenas a mensagem de sucesso.
 *     tags: [Acesso restrito - Professores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 670a12bd9b3e
 *         description: ID do post
 *     responses:
 *       200:
 *         description: Post excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post excluído com sucesso
 *       401:
 *         description: Usuário não cadastrado ou senha incorreta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário não cadastrado ou senha incorreta
 *       403:
 *         description: Acesso restrito a professores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Acesso restrito a professores
 *       404:
 *         description: Post não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post não encontrado
 */
postsRoutes.delete("/:id", validarProfessor, PostsController.excluirPost);

export default postsRoutes;
