import bcrypt from "bcryptjs";
import UsuariosController from "../src/controllers/usuariosController.js";
import { Usuario } from "../src/models/Usuario.js";

jest.mock("bcryptjs");
jest.mock("../src/models/Usuario.js");

describe("UsuariosController", () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("criarUsuario", () => {
    it("retorna 400 quando nome não é enviado", async () => {
      req.body = { email: "prof@test.com", role: "professor" };

      await UsuariosController.criarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Nome é obrigatório" });
    });

    it("retorna 400 quando role é inválida", async () => {
      req.body = { nome: "Teste", role: "admin" };

      await UsuariosController.criarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Role inválida" });
    });

    it("cria professor com sucesso", async () => {
      req.body = { nome: "Professor", email: "prof@test.com", role: "professor" };
      Usuario.create.mockResolvedValue({
        _id: "u1",
        nome: "Professor",
        email: "prof@test.com",
        rm: undefined,
        role: "professor",
        primeiroAcesso: true,
      });

      await UsuariosController.criarUsuario(req, res);

      expect(Usuario.create).toHaveBeenCalledWith({
        nome: "Professor",
        email: "prof@test.com",
        role: "professor",
        primeiroAcesso: true,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("retorna 400 ao criar professor sem email", async () => {
      req.body = { nome: "Professor", role: "professor" };

      await UsuariosController.criarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email é obrigatório para professor" });
    });

    it("cria aluno com sucesso", async () => {
      req.body = { nome: "Aluno", rm: "123", role: "aluno" };
      Usuario.create.mockResolvedValue({
        _id: "u2",
        nome: "Aluno",
        rm: "123",
        role: "aluno",
        primeiroAcesso: false,
      });

      await UsuariosController.criarUsuario(req, res);

      expect(Usuario.create).toHaveBeenCalledWith({
        nome: "Aluno",
        rm: "123",
        role: "aluno",
        primeiroAcesso: false,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("retorna 409 para duplicidade", async () => {
      req.body = { nome: "Professor", email: "prof@test.com", role: "professor" };
      const err = new Error("duplicado");
      err.code = 11000;
      Usuario.create.mockRejectedValue(err);

      await UsuariosController.criarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Email já cadastrado" });
    });
  });

  describe("listarUsuarios", () => {
    it("lista usuários com paginação e termo", async () => {
      req.query = { role: "professor", termo: "jo", page: "2", limit: "1" };

      const sortMock = jest.fn().mockResolvedValue([
        { _id: "u1", nome: "João", email: "jo@test.com", rm: null, role: "professor" },
      ]);
      const limitMock = jest.fn(() => ({ sort: sortMock }));
      const skipMock = jest.fn(() => ({ limit: limitMock }));
      const selectMock = jest.fn(() => ({ skip: skipMock }));
      const collationMock = jest.fn(() => ({ select: selectMock }));

      Usuario.find.mockReturnValue({ collation: collationMock });
      Usuario.countDocuments.mockResolvedValue(2);

      await UsuariosController.listarUsuarios(req, res);

      expect(Usuario.find).toHaveBeenCalled();
      const filtro = Usuario.find.mock.calls[0][0];
      expect(filtro.role).toBe("professor");
      expect(filtro.$or).toBeDefined();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        usuarios: [
          { id: "u1", nome: "João", email: "jo@test.com", rm: null, role: "professor" },
        ],
        total: 2,
        page: 2,
        limit: 1,
        hasMore: false,
      });
    });
  });

  describe("obterUsuario", () => {
    it("retorna 404 quando usuário não existe", async () => {
      req.params.id = "nao-existe";
      Usuario.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await UsuariosController.obterUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("atualizarUsuario", () => {
    it("atualiza usuário e criptografa senha", async () => {
      req.params.id = "u1";
      req.body = { nome: "Novo Nome", senha: "123456", role: "professor" };
      const save = jest.fn().mockResolvedValue(true);
      const usuario = { _id: "u1", nome: "Velho", email: "e", rm: "1", role: "aluno", save };
      Usuario.findById.mockResolvedValue(usuario);
      bcrypt.hash.mockResolvedValue("hash");

      await UsuariosController.atualizarUsuario(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
      expect(usuario.senha).toBe("hash");
      expect(usuario.nome).toBe("Novo Nome");
      expect(usuario.role).toBe("professor");
      expect(save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("excluirUsuario", () => {
    it("remove usuário com sucesso", async () => {
      req.params.id = "u1";
      Usuario.findByIdAndDelete.mockResolvedValue({ _id: "u1" });

      await UsuariosController.excluirUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Usuário removido com sucesso" });
    });
  });
});
