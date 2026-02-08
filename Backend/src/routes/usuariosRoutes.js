import express from "express";
import UsuariosController from "../controllers/usuariosController.js";
import { validarProfessor } from "../middleware/validarProfessor.js";

const usuariosRoutes = express.Router();

usuariosRoutes.post("/", validarProfessor, UsuariosController.criarUsuario);
usuariosRoutes.get("/", validarProfessor, UsuariosController.listarUsuarios);
usuariosRoutes.get("/:id", validarProfessor, UsuariosController.obterUsuario);
usuariosRoutes.put("/:id", validarProfessor, UsuariosController.atualizarUsuario);
usuariosRoutes.delete("/:id", validarProfessor, UsuariosController.excluirUsuario);

export default usuariosRoutes;
