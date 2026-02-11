import api, { assertProfessorPermission } from '../api';
import { fetchPosts, fetchPost, createPost, updatePost, deletePost } from '../posts';

jest.mock('../api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  assertProfessorPermission: jest.fn(),
}));

describe('posts service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetchPosts com termo usa /posts/search e normaliza array', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: [{ id: '1', titulo: 'T', autor: 'A', conteudo: 'C', comentarios: [1, 2] }] });
    const result = await fetchPosts({ termo: 'mat' });
    expect(api.get).toHaveBeenCalledWith('/posts/search?q=mat');
    expect(result.items[0]).toMatchObject({ _id: '1', autoria: 'A', comentariosCount: 2 });
    expect(result.total).toBe(1);
  });

  it('fetchPosts paginado normaliza posts', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { posts: [{ _id: '2', titulo: 'X', autor: 'Y' }], total: 5, page: 2, limit: 1, hasMore: true } });
    const result = await fetchPosts({ page: 2, limit: 1, autor: 'Y' });
    expect(api.get).toHaveBeenCalledWith('/posts?page=2&limit=1&autor=Y');
    expect(result).toMatchObject({ total: 5, page: 2, limit: 1, hasMore: true });
    expect(result.items[0]._id).toBe('2');
  });

  it('fetchPost normaliza campos alternativos', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { id: '3', titulo: 'Z', 'criado em': '01/01/2025' } });
    const post = await fetchPost('3');
    expect(post._id).toBe('3');
    expect(post.CriadoEm).toBe('01/01/2025');
  });

  it('create/update/delete exigem permissão de professor', async () => {
    (assertProfessorPermission as jest.Mock).mockResolvedValue(undefined);
    (api.post as jest.Mock).mockResolvedValue({ data: { id: '10', titulo: 'Novo' } });
    (api.put as jest.Mock).mockResolvedValue({ data: { id: '10', titulo: 'Edit' } });

    const created = await createPost({ titulo: 'Novo', conteudo: 'C', autoria: 'A' });
    const updated = await updatePost('10', { titulo: 'Edit', conteudo: 'C2', autoria: 'A' });
    await deletePost('10');

    expect(assertProfessorPermission).toHaveBeenCalledTimes(3);
    expect(api.delete).toHaveBeenCalledWith('/posts/10');
    expect(created._id).toBe('10');
    expect(updated.titulo).toBe('Edit');
  });
});
