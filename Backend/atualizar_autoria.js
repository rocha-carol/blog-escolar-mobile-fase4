// Script para atualizar posts antigos e adicionar o campo autoria
import mongoose from "mongoose";
import { Posts } from "./src/models/Post.js";

const MONGO_URI = "mongodb://localhost:27017/seubanco"; // Altere para sua conexão

async function atualizarAutoria() {
    await mongoose.connect(MONGO_URI);
    const result = await Posts.updateMany(
        { autoria: { $exists: false } },
        { $set: { autoria: "Desconhecido" } }
    );
    console.log(`Posts atualizados: ${result.modifiedCount}`);
    await mongoose.disconnect();
}

atualizarAutoria().catch(console.error);
