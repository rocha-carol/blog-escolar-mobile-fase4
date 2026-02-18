describe('api service + permissões', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('assertProfessorPermission valida ausência de usuário, role e credenciais', async () => {
    const getItem = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('x');

    jest.doMock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem } }));
    jest.doMock('axios', () => ({ __esModule: true, default: { create: () => ({ interceptors: { request: { use: jest.fn() } } }) } }));

    const { assertProfessorPermission, PermissionError } = await import('../api');
    await expect(assertProfessorPermission()).rejects.toBeInstanceOf(PermissionError);

    getItem.mockReset()
      .mockResolvedValueOnce(JSON.stringify({ role: 'aluno' }))
      .mockResolvedValueOnce('cred');
    await expect(assertProfessorPermission()).rejects.toBeInstanceOf(PermissionError);

    getItem.mockReset()
      .mockResolvedValueOnce(JSON.stringify({ role: 'professor' }))
      .mockResolvedValueOnce(null);
    await expect(assertProfessorPermission()).rejects.toBeInstanceOf(PermissionError);
  });


  it('assertProfessorPermission rejeita JSON inválido de usuário/credenciais', async () => {
    const getItem = jest.fn()
      .mockResolvedValueOnce('{')
      .mockResolvedValueOnce(JSON.stringify({ email: 'e@x.com', senha: '123' }));

    jest.doMock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem } }));
    jest.doMock('axios', () => ({ __esModule: true, default: { create: () => ({ interceptors: { request: { use: jest.fn() } } }) } }));

    const { assertProfessorPermission, PermissionError } = await import('../api');
    await expect(assertProfessorPermission()).rejects.toBeInstanceOf(PermissionError);

    getItem.mockReset()
      .mockResolvedValueOnce(JSON.stringify({ role: 'professor' }))
      .mockResolvedValueOnce('{');

    await expect(assertProfessorPermission()).rejects.toBeInstanceOf(PermissionError);
  });

  it('interceptor injeta headers x-email e x-senha quando há credenciais', async () => {
    const use = jest.fn();
    const getItem = jest.fn().mockResolvedValue(JSON.stringify({ email: 'e@x.com', senha: '123' }));

    jest.doMock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem } }));
    jest.doMock('axios', () => ({
      __esModule: true,
      default: { create: () => ({ interceptors: { request: { use } } }) },
    }));

    await import('../api');
    const interceptor = use.mock.calls[0][0];
    const config = await interceptor({ headers: {} });

    expect(config.headers['x-email']).toBe('e@x.com');
    expect(config.headers['x-senha']).toBe('123');
  });

  it('interceptor ignora credenciais inválidas sem quebrar a requisição', async () => {
    const use = jest.fn();
    const getItem = jest.fn().mockResolvedValue('{');

    jest.doMock('@react-native-async-storage/async-storage', () => ({ __esModule: true, default: { getItem } }));
    jest.doMock('axios', () => ({
      __esModule: true,
      default: { create: () => ({ interceptors: { request: { use } } }) },
    }));

    await import('../api');
    const interceptor = use.mock.calls[0][0];
    const config = await interceptor({});

    expect(config.headers).toBeUndefined();
  });
});
