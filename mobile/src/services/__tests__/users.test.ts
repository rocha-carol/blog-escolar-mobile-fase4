import api, { assertProfessorPermission } from '../api';
import { createUser, fetchUsers, fetchUser, updateUser, deleteUser } from '../users';

jest.mock('../api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
  assertProfessorPermission: jest.fn(),
}));

describe('users service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('createUser chama endpoint de usuários', async () => {
    (assertProfessorPermission as jest.Mock).mockResolvedValue(undefined);
    (api.post as jest.Mock).mockResolvedValue({ data: { usuario: { id: 'u1', nome: 'Prof', role: 'professor' } } });

    const user = await createUser({ nome: 'Prof', email: 'p@x.com', role: 'professor' });
    expect(user.id).toBe('u1');
    expect(api.post).toHaveBeenCalledWith('/usuarios', { nome: 'Prof', email: 'p@x.com', role: 'professor' });
  });

  it('fetchUsers aplica trim e paginação', async () => {
    (assertProfessorPermission as jest.Mock).mockResolvedValue(undefined);
    (api.get as jest.Mock).mockResolvedValue({ data: { usuarios: [{ id: 'u2' }], total: 1, page: 1, limit: 10, hasMore: false } });

    const result = await fetchUsers({ role: 'aluno', termo: '  jo  ', page: 1, limit: 10 });
    expect(api.get).toHaveBeenCalledWith('/usuarios?role=aluno&termo=jo&page=1&limit=10');
    expect(result.items).toHaveLength(1);
  });

  it('fetchUser/updateUser/deleteUser mapeiam resposta', async () => {
    (assertProfessorPermission as jest.Mock).mockResolvedValue(undefined);
    (api.get as jest.Mock).mockResolvedValue({ data: { usuario: { id: 'u3' } } });
    (api.put as jest.Mock).mockResolvedValue({ data: { usuario: { id: 'u3', nome: 'Novo' } } });

    await expect(fetchUser('u3')).resolves.toEqual({ id: 'u3' });
    await expect(updateUser('u3', { nome: 'Novo', role: 'professor' })).resolves.toEqual({ id: 'u3', nome: 'Novo' });
    await deleteUser('u3');
    expect(api.delete).toHaveBeenCalledWith('/usuarios/u3');
  });
});
