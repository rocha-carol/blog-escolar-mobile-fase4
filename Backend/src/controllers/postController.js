import { Posts } from "../models/Post.js";
import { Usuario } from "../models/Usuario.js";
import { Comentario } from "../models/Comentario.js";

const MAX_PREVIEW_LENGTH = 200;

// Função auxiliar para formatar data
function formatarData(data) {
  const d = new Date(data);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarHora(data) {
  const d = new Date(data);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}h${m}`;
}

function criarResumo(conteudo) {
  if (!conteudo) return "";
  if (conteudo.length <= MAX_PREVIEW_LENGTH) return conteudo;
  return `${conteudo.substring(0, MAX_PREVIEW_LENGTH)}...`;
}

function parseNumeroPositivo(valor, fallback, max = null) {
  const numero = Number.parseInt(valor, 10);
  if (Number.isNaN(numero) || numero <= 0) return fallback;
  if (max !== null) return Math.min(numero, max);
  return numero;
}

function foiAtualizado(createdAt, updatedAt) {
  if (!createdAt || !updatedAt) return false;
  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();
  return updated > created;
}

class PostsController {

  // Listar todos os posts
  static async listarPosts(req, res) {
    try {
      // Suporte a paginação
      const hasPagingParams = req.query.page !== undefined || req.query.limit !== undefined;
      const page = parseNumeroPositivo(req.query.page, 1);
      const limit = parseNumeroPositivo(req.query.limit, 10, 50);
      const skip = (page - 1) * limit;

      // Filtra por autoria se parâmetro autor for fornecido
      let filtro = {};
      if (req.query.autor) {
        filtro = { autoria: req.query.autor };
      }

      const total = await Posts.countDocuments(filtro);
      const query = Posts.find(filtro)
        .lean()
        // Mais recente primeiro: prioriza atualizações; se não houver, cai no createdAt.
        .sort({ updatedAt: -1, createdAt: -1 });

      const posts = hasPagingParams ? await query.skip(skip).limit(limit) : await query;


      // Busca contagem de comentários para cada post
      const postsFormatados = await Promise.all(posts.map(async post => {
        const atualizado = foiAtualizado(post.createdAt, post.updatedAt);
        const comentariosCount = await Comentario.countDocuments({ post: post._id });
        return {
          id: post._id,
          titulo: post.titulo,
          autor: post.autoria,
          conteudo: criarResumo(post.conteudo),
          areaDoConhecimento: post.areaDoConhecimento,
          status: post.status || "publicado",
          imagem: post.imagem,
          CriadoEm: post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : undefined,
          CriadoEmHora: post.createdAt ? (() => {
            const d = new Date(post.createdAt);
            const h = d.getHours().toString().padStart(2, '0');
            const m = d.getMinutes().toString().padStart(2, '0');
            return `${h}h${m}`;
          })() : undefined,
          AtualizadoEm: atualizado ? new Date(post.updatedAt).toLocaleDateString('pt-BR') : undefined,
          AtualizadoEmHora: atualizado ? (() => {
            const d = new Date(post.updatedAt);
            const h = d.getHours().toString().padStart(2, '0');
            const m = d.getMinutes().toString().padStart(2, '0');
            return `${h}h${m}`;
          })() : undefined,
          comentariosCount
        };
      }));

      // Compatibilidade:
      // - Sem page/limit: retorna array (usado em testes/integrações antigas)
      // - Com page/limit: retorna objeto paginado (usado pelo mobile)
      if (!hasPagingParams) {
        return res.json(postsFormatados);
      }

      return res.json({
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

      const atualizado = foiAtualizado(post.createdAt, post.updatedAt);

      const comentariosCount = await Comentario.countDocuments({ post: post._id });

      res.json({
        id: post._id,
        titulo: post.titulo,
        autor: post.autoria,
        conteudo: post.conteudo,
        areaDoConhecimento: post.areaDoConhecimento,
        status: post.status || "publicado",
        imagem: post.imagem,
        CriadoEm: formatarData(post.createdAt),
        AtualizadoEm: atualizado ? formatarData(post.updatedAt) : undefined,
        comentariosCount,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Criar post (somente professores)
  static async criarPost(req, res) {
    try {
      const { titulo, conteudo, areaDoConhecimento, status, imagem } = req.body;

      if (!titulo || !conteudo || !areaDoConhecimento) {
        return res.status(400).json({ message: "Título, conteúdo e área do conhecimento são obrigatórios" });
      }

      // O usuário que vem do token
      const usuario = await Usuario.findById(req.usuario.id);
      if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

      // Se imagem foi enviada, salva buffer ou caminho (ajuste conforme sua persistência)
      let imagemUrl = null;
      if (req.file) {
        // Exemplo: salva como base64 no banco (não recomendado para produção)
        imagemUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else if (typeof imagem === "string" && imagem.trim()) {
        // Suporta envio direto pelo body (URL ou data URL)
        imagemUrl = imagem.trim();
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
        // compatibilidade com o mobile (que usa _id)
        _id: novoPost._id,
        id: novoPost._id,
        titulo: novoPost.titulo,
        autor: novoPost.autoria,
        autoria: novoPost.autoria,
        conteudo: criarResumo(novoPost.conteudo),
        areaDoConhecimento: novoPost.areaDoConhecimento,
        status: novoPost.status,
        imagem: novoPost.imagem,
        CriadoEm: formatarData(novoPost.createdAt),
        CriadoEmHora: formatarHora(novoPost.createdAt),
        AtualizadoEm: foiAtualizado(novoPost.createdAt, novoPost.updatedAt) ? formatarData(novoPost.updatedAt) : undefined
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  // Editar post (somente professores)
  static async editarPost(req, res) {
    try {
      const { id } = req.params;
      const { titulo, conteudo, areaDoConhecimento, status, imagem } = req.body;

      const post = await Posts.findById(id);
      if (!post) return res.status(404).json({ message: "Post não encontrado" });

      if (!titulo && !conteudo && !areaDoConhecimento && !status && !req.file && !(typeof imagem === "string" && imagem.trim())) {
        return res.status(400).json({ message: "Nenhum dado enviado para atualização" });
      }

      if (titulo) post.titulo = titulo;
      if (conteudo) post.conteudo = conteudo;
      if (areaDoConhecimento) post.areaDoConhecimento = areaDoConhecimento;
      if (status) post.status = status;
      if (req.file) {
        post.imagem = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else if (typeof imagem === "string" && imagem.trim()) {
        post.imagem = imagem.trim();
      }

      await post.save();

      res.json({
        message: "Post atualizado com sucesso",
        // compatibilidade com o mobile (que usa _id)
        _id: post._id,
        id: post._id,
        titulo: post.titulo,
        conteudo: post.conteudo,
        autor: post.autoria,
        autoria: post.autoria,
        areaDoConhecimento: post.areaDoConhecimento,
        imagem: post.imagem,
        AtualizadoEm: formatarData(post.updatedAt),
        AtualizadoEmHora: formatarHora(post.updatedAt),
        "atualizado em": formatarData(post.updatedAt)
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
      const q = req.query.q || req.query.palavra;
      if (!q) return res.status(400).json({ message: "Parâmetro de busca não informado" });

      const regex = new RegExp(q, "i");

      const posts = await Posts.find({
        $or: [
          { titulo: regex },
          { conteudo: regex },
          { areaDoConhecimento: regex },
        ]
      })
        .lean()
        .sort({ updatedAt: -1, createdAt: -1 });

      const resultado = posts.map(post => ({
        // compatibilidade com o mobile (que usa _id)
        _id: post._id,
        id: post._id,
        titulo: post.titulo,
        autor: post.autoria,
        autoria: post.autoria,
        conteudo: criarResumo(post.conteudo),
        areaDoConhecimento: post.areaDoConhecimento,
        imagem: post.imagem,
        CriadoEm: formatarData(post.createdAt),
        "criado em": formatarData(post.createdAt)
      }));

      res.json(resultado);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default PostsController;
