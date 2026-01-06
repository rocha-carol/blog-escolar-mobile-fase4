// Script para criar usuário fictício e 3 posts
import mongoose from "mongoose";
import { Usuario } from "./src/models/Usuario.js";
import { Posts } from "./src/models/Post.js";

const MONGO_URI = "mongodb://localhost:27017/seubanco"; // Altere para sua conexão

async function criarUsuarioEPosts() {
    await mongoose.connect(MONGO_URI);

    // Cria usuário fictício
    const usuario = new Usuario({
        nome: "Prof. Ficticio",
        email: "ficticio@teste.com",
        senha: "123456",
        role: "professor"
    });
    await usuario.save();

    // Cria 3 posts para esse usuário
    const posts = [
        {
            titulo: "Primeiro post do fictício",
            conteudo: "Conteúdo do primeiro post. Este texto é apenas um exemplo para visualização.",
            areaDoConhecimento: "Linguagens",
            autoria: usuario.nome,
            status: "publicado"
        },
        {
            titulo: "Segundo post do fictício",
            conteudo: "Segundo conteúdo. Mais um exemplo para testar a listagem de posts.",
            areaDoConhecimento: "Matemática",
            autoria: usuario.nome,
            status: "publicado"
        },
        {
            titulo: "Terceiro post do fictício",
            conteudo: "Terceiro conteúdo. Testando a visualização de múltiplos posts.",
            areaDoConhecimento: "Tecnologias",
            autoria: usuario.nome,
            status: "publicado"
        }
    ];
    await Posts.insertMany(posts);

    console.log("Usuário e posts fictícios criados!");
    await mongoose.disconnect();
}

criarUsuarioEPosts().catch(console.error);
