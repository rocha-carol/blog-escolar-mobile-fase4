import api from '../api';
import { fetchComments, createComment } from '../comments';

jest.mock('../api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

describe('comments service', () => {
  it('fetchComments retorna vazio quando payload não é array', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { invalid: true } });
    await expect(fetchComments('p1')).resolves.toEqual([]);
  });

  it('fetchComments normaliza e filtra comentários inválidos', async () => {
    (api.get as jest.Mock).mockResolvedValue({
      data: [
        { _id: 'c1', post: 'p1', autor: 'Ana', texto: 'Oi', createdAt: '2025-01-01T10:00:00.000Z' },
        { post: 'p1', texto: 'sem id' },
      ],
    });

    const comments = await fetchComments('p1');
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({ id: 'c1', postId: 'p1', author: 'Ana', message: 'Oi' });
  });

  it('createComment normaliza fallback de autor e data inválida', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { _id: 'c2', post: 'p2', texto: 'Teste', criadoEm: 'data-invalida' } });
    const comment = await createComment('p2', { texto: 'Teste' });
    expect(comment.author).toBe('Anônimo');
    expect(comment.createdAt).toBe('data-invalida');
  });
});
