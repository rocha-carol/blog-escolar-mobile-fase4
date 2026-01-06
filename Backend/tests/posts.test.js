import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import app from "../src/app.js";
import conectaNaDatabase, { disconnectTestDB } from "../src/config/dbConnect.js";
import { Posts } from "../src/models/Post.js";
import { Usuario } from "../src/models/Usuario.js";

jest.setTimeout(60000); //aumenta timeout para evitar falhas em testes demorados

let professor;

describe("Testes de Posts", () => {

    // Executado antes de todos os testes
    beforeAll(async () => {
        process.env.NODE_ENV = "test";

        // Conecta apenas uma vez
        const conexao = await conectaNaDatabase();

        // Cria um usuário professor para simular login/autorização
        const hashedSenha = await bcrypt.hash("123456", 10);
        professor = await Usuario.create({
            nome: "Professor Teste",
            email: "professor@teste.com",
            senha: hashedSenha,
            role: "professor"
        });
    });

    // Desconecta do banco após todos os testes
    afterAll(async () => {
        await disconnectTestDB();
    });

    afterEach(async () => {
        // Limpa apenas os posts
        await Posts.deleteMany({});
    });


    // LISTAR POSTS
    it("Deve listar todos os posts", async () => {
        await Posts.create({
            titulo: "Post 1",
            conteudo: "Conteúdo do post 1",
            areaDoConhecimento: "Matemática",
        });

        const res = await request(app).get("/posts");

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0].titulo).toBe("Post 1");
    });

    // LER POST POR ID
    it("Deve ler um post pelo ID", async () => {
        const post = await Posts.create({
            titulo: "Post 2",
            conteudo: "Conteúdo do post 2",
            areaDoConhecimento: "Ciências Humanas",
        });

        const res = await request(app).get(`/posts/${post._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.titulo).toBe("Post 2");
    });

    it("Deve retornar 404 ao ler post inexistente", async () => {
        const res = await request(app).get(`/posts/${new mongoose.Types.ObjectId()}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Post não encontrado");
    });

    // CRIAR POST
    it("Deve criar um post como professor", async () => {
        const res = await request(app)
            .post("/posts")
            .send({
                email: "professor@teste.com",
                senha: "123456",
                titulo: "Novo Post",
                conteudo: "Conteúdo do novo post",
                areaDoConhecimento: "Linguagens",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.titulo).toBe("Novo Post");
    });

    it("Deve criar um post", async () => {
        const res = await request(app)
            .post("/posts")
            .send({
                email: "professor@teste.com",
                senha: "123456",
                // Removido teste de rascunho
                areaDoConhecimento: "Tecnologias"
            });

        expect(res.statusCode).toBe(201);
    });

    it("Deve falhar ao criar post com usuário inválido", async () => {
        const res = await request(app)
            .post("/posts")
            .send({
                email: "outro@teste.com",
                senha: "123456",
                titulo: "Novo Post",
                conteudo: "Conteúdo",
                areaDoConhecimento: "Linguagens"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Usuário não encontrado");
    });

    // EDITAR POST
    it("Deve editar um post existente", async () => {
        const post = await Posts.create({
            titulo: "Post Editar",
            conteudo: "Conteúdo antigo",
            areaDoConhecimento: "Tecnologias",
        });

        const res = await request(app)
            .put(`/posts/${post._id}`)
            .send({
                email: "professor@teste.com",
                senha: "123456",
                titulo: "Post Editado",
                conteudo: "Conteúdo atualizado"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.titulo).toBe("Post Editado");
        expect(res.body["atualizado em"]).toBeDefined();
    });

    it("Deve retornar 404 ao editar post inexistente", async () => {
        const res = await request(app)
            .put(`/posts/${new mongoose.Types.ObjectId()}`)
            .send({
                email: "professor@teste.com",
                senha: "123456",
                titulo: "Post Editado",
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Post não encontrado");
    });

    // EXCLUIR POST
    it("Deve excluir um post existente", async () => {
        const post = await Posts.create({
            titulo: "Post Deletar",
            conteudo: "Conteúdo para deletar",
            areaDoConhecimento: "Ciências da Natureza",
        });

        const res = await request(app)
            .delete(`/posts/${post._id}`)
            .send({
                email: "professor@teste.com",
                senha: "123456",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Post excluído com sucesso");
    });

    it("Deve retornar 404 ao excluir post inexistente", async () => {
        const res = await request(app)
            .delete(`/posts/${new mongoose.Types.ObjectId()}`)
            .send({
                email: "professor@teste.com",
                senha: "123456",
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Post não encontrado");
    });

    // BUSCA POR PALAVRA-CHAVE
    it("Deve buscar posts por palavra-chave no título", async () => {
        await Posts.create({
            titulo: "Matemática Avançada",
            conteudo: "Conteúdo sobre matemática",
            areaDoConhecimento: "Matemática",
        });

        await Posts.create({
            titulo: "Linguagens Básicas",
            conteudo: "Conteúdo sobre linguagens",
            areaDoConhecimento: "Linguagens",
        });

        const res = await request(app).get("/posts/search?q=Matemática");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].titulo).toBe("Matemática Avançada");
    });

    it("Deve retornar 400 se não enviar parâmetro de busca", async () => {
        const res = await request(app).get("/posts/search");
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Parâmetro de busca não informado");
    });
});

// Teste separado para verificar formatação de datas
test("deve formatar corretamente as datas no método toJSON do Post", async () => {
    const post = new Posts({
        titulo: "Teste de formato",
        conteudo: "Conteúdo teste",
        areaDoConhecimento: "Linguagens",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
    });

    const json = post.toJSON();

    expect(json.createdAt).toContain("Criado em:");
    expect(json.updatedAt).toContain("Atualizado em:");
});
