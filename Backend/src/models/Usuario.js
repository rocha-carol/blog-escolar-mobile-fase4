import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: function () {
      return this.role === "professor";
    },
  },
  rm: {
    type: String,
    unique: true,
    required: function () {
      return this.role === "aluno";
    },
  },
  primeiroAcesso: { type: Boolean, default: false },
  senha: {
    type: String,
    required: function () {
      return this.role === "professor" && !this.primeiroAcesso;
    },
  },
  role: { type: String, default: "professor" }
});

const Usuario = mongoose.model("professor", usuarioSchema);

export { Usuario, usuarioSchema };
