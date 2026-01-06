import { Posts } from "../models/Post.js";
import { Usuario } from "../models/Usuario.js";

// Função auxiliar para formatar data
function formatarData(data) {
  const d = new Date(data);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

class PostsController {

  // Listar todos os posts
  static async listarPosts(req, res) {
    try {
      // Suporte a paginação
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Filtra por autoria se parâmetro autor for fornecido
      let filtro = {};
      if (req.query.autor) {
        filtro = { autoria: req.query.autor };
      }

      const total = await Posts.countDocuments(filtro);
      const posts = await Posts.find(filtro)
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const postsFormatados = posts.map(post => ({
        id: post._id,
        titulo: post.titulo,
        conteudo: post.conteudo.substring(0, 200) + "...",
        areaDoConhecimento: post.areaDoConhecimento,
        status: post.status || "publicado",
        CriadoEm: post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : undefined,
        CriadoEmHora: post.createdAt ? (() => {
          const d = new Date(post.createdAt);
          const h = d.getHours().toString().padStart(2, '0');
          const m = d.getMinutes().toString().padStart(2, '0');
          return `${h}h${m}`;
        })() : undefined,
        AtualizadoEm: post.updatedAt ? new Date(post.updatedAt).toLocaleDateString('pt-BR') : undefined,
        AtualizadoEmHora: post.updatedAt ? (() => {
          const d = new Date(post.updatedAt);
          const h = d.getHours().toString().padStart(2, '0');
          const m = d.getMinutes().toString().padStart(2, '0');
          return `${h}h${m}`;
        })() : undefined
      }));

      res.json({
        posts: postsFormatados,
        total,
        page,
        limit,
        hasMore: skip + posts.length < total
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Ler post por ID
  static async lerPost(req, res) {
    try {
      const { id } = req.params;
      const post = await Posts.findById(id).lean();

      if (!post) return res.status(404).json({ message: "Post não encontrado" });

      res.json({
        titulo: post.titulo,
        conteudo: post.conteudo,
        areaDoConhecimento: post.areaDoConhecimento,
        status: post.status || "publicado",
        CriadoEm: formatarData(post.createdAt),
        AtualizadoEm: post.updatedAt ? formatarData(post.updatedAt) : undefined
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Criar post (somente professores)
  static async criarPost(req, res) {
    try {
      const { titulo, conteudo, areaDoConhecimento, status } = req.body;

      // O usuário que vem do token
      const usuario = await Usuario.findById(req.usuario.id);
      if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

      // Se imagem foi enviada, salva buffer ou caminho (ajuste conforme sua persistência)
      let imagemUrl = null;
      if (req.file) {
        // Exemplo: salva como base64 no banco (não recomendado para produção)
        imagemUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      const novoPost = new Posts({
        titulo,
        conteudo,
        areaDoConhecimento,
        status: status || "publicado",
        autoria: usuario.nome,
        imagem: imagemUrl
      });

      await novoPost.save();

      res.status(201).json({
        message: "Post criado com sucesso",
        titulo: novoPost.titulo,
        conteudo: novoPost.conteudo.substring(0, 100) + "...",
        areaDoConhecimento: novoPost.areaDoConhecimento,
        status: novoPost.status,
        imagem: novoPost.imagem,
        CriadoEm: formatarData(novoPost.createdAt),
        AtualizadoEm: novoPost.updatedAt ? formatarData(novoPost.updatedAt) : undefined
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // Editar post (somente professores)
  static async editarPost(req, res) {
    try {
      const { id } = req.params;
      const { titulo, conteudo, areaDoConhecimento } = req.body;

      const post = await Posts.findById(id);
      if (!post) return res.status(404).json({ message: "Post não encontrado" });

      if (titulo) post.titulo = titulo;
      if (conteudo) post.conteudo = conteudo;
      if (areaDoConhecimento) post.areaDoConhecimento = areaDoConhecimento;
      if (req.file) {
        post.imagem = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      await post.save();

      res.json({
        message: "Post atualizado com sucesso",
        titulo: post.titulo,
        conteudo: post.conteudo,
        areaDoConhecimento: post.areaDoConhecimento,
        imagem: post.imagem,
        atualizadoEm: formatarData(post.updatedAt)
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // Excluir post (somente professores)
  static async excluirPost(req, res) {
    try {
      const { id } = req.params;
      const post = await Posts.findById(id);
      if (!post) {
        return res.status(404).json({ message: "Post não encontrado" });
      }
      // Retorna o post antes de deletar
      await post.deleteOne();
      return res.status(200).json({ message: "Post excluído com sucesso", post });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  // Buscar posts por palavra-chave no título, conteúdo ou área do conhecimento
  static async buscarPosts(req, res) {
    try {
      const { q } = req.query;
      if (!q) return res.status(400).json({ message: "Parâmetro de busca não informado" });

      const regex = new RegExp(q, "i");

      const posts = await Posts.find({
        $or: [
          { titulo: regex },
          { conteudo: regex },
          { areaDoConhecimento: regex },
        ]
      }).lean();

      const resultado = posts.map(post => ({
        titulo: post.titulo,
        conteudo: post.conteudo.substring(0, 200) + (post.conteudo.length > 200 ? "..." : ""),
        areaDoConhecimento: post.areaDoConhecimento,
        "criado em": formatarData(post.createdAt)
      }));

      res.json(resultado);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default PostsController;
