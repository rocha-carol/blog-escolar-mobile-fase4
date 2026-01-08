import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  role: { type: String, default: "professor" }
});

const Usuario = mongoose.model("professor", usuarioSchema);

export { Usuario, usuarioSchema };
