import bcrypt from "bcryptjs";
import { validarProfessor } from "../src/middleware/validarProfessor.js";
import { Usuario } from "../src/models/Usuario.js";

jest.mock("bcryptjs");
jest.mock("../src/models/Usuario.js");

describe("middleware validarProfessor", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {}, query: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("retorna 401 quando credenciais não são enviadas", async () => {
    await validarProfessor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 400 quando usuário não existe", async () => {
    req.body = { email: "teste@x.com", senha: "123" };
    Usuario.findOne.mockResolvedValue(null);

    await validarProfessor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuário não encontrado" });
  });

  it("retorna 401 quando é primeiro acesso", async () => {
    req.query = { email: "teste@x.com", senha: "123" };
    Usuario.findOne.mockResolvedValue({ primeiroAcesso: true });

    await validarProfessor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("retorna 403 quando usuário não é professor", async () => {
    req.headers = { "x-email": "teste@x.com", "x-senha": "123" };
    Usuario.findOne.mockResolvedValue({ senha: "hash", role: "aluno", primeiroAcesso: false });
    bcrypt.compare.mockResolvedValue(true);

    await validarProfessor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("chama next quando usuário professor e senha correta", async () => {
    req.body = { email: "prof@x.com", senha: "123" };
    Usuario.findOne.mockResolvedValue({
      _id: "u1",
      nome: "Professor",
      email: "prof@x.com",
      senha: "hash",
      role: "professor",
      primeiroAcesso: false,
    });
    bcrypt.compare.mockResolvedValue(true);

    await validarProfessor(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.usuario).toEqual({
      id: "u1",
      nome: "Professor",
      email: "prof@x.com",
      role: "professor",
    });
  });
});
