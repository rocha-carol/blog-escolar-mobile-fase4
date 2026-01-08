import mongoose from "mongoose";

const ComentarioSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Posts", required: true },
    autor: { type: String, required: true },
    texto: { type: String, required: true },
    criadoEm: { type: Date, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});

const Comentario = mongoose.model("Comentario", ComentarioSchema);

export { Comentario };
