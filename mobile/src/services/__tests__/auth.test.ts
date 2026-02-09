import api from '../api';
import { login, loginAluno, registerUser } from '../auth';

jest.mock('../api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

describe('auth service', () => {
  it('login mapeia user e firstAccess', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { usuario: { id: '1', nome: 'Ana', role: 'professor' }, firstAccess: true } });
    const result = await login('a@a.com', '123');
    expect(api.post).toHaveBeenCalledWith('/usuario/login', { email: 'a@a.com', senha: '123' });
    expect(result).toEqual({ user: { id: '1', nome: 'Ana', role: 'professor' }, firstAccess: true });
  });

  it('loginAluno retorna usuario de aluno', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { usuario: { id: '2', nome: 'Bia', rm: '10', role: 'aluno' } } });
    await expect(loginAluno('Bia', '10')).resolves.toEqual({ id: '2', nome: 'Bia', rm: '10', role: 'aluno' });
  });

  it('registerUser retorna Usuario da API', async () => {
    const payload = { nome: 'Prof', email: 'p@x.com', senha: '123', role: 'professor' as const };
    (api.post as jest.Mock).mockResolvedValue({ data: { Usuario: { id: '9', ...payload } } });
    const user = await registerUser(payload);
    expect(user.id).toBe('9');
  });
});
