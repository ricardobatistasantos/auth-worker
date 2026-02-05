import { LoginUseCase } from '@application/use-cases/login.use-case';
import { userRepositoryMock } from '../../domain/repository/user.repository.mock';
import { bcryptServiceMock } from '../../helpers/bcrypt.service.mock';
import { jwtServiceMock } from '../../helpers/jwt.service.mock';

describe('LoginUseCase', () => {
  const userRepo = userRepositoryMock();
  const bcrypt = bcryptServiceMock();
  const jwt = jwtServiceMock();

  const useCase = new LoginUseCase(userRepo, jwt, bcrypt);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve autenticar usuário com credenciais válidas', async () => {
    userRepo.findByEmail.mockResolvedValue({
      id: '1',
      email: 'teste@email.com',
      password: 'hash',
      profile: {
        id: 'p1',
        code: 'admin',
        name: 'Admin',
      },
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.generateToken.mockReturnValue('token-jwt');

    const result = await useCase.execute('teste@email.com', '123456');

    expect(result.accessToken).toBe('token-jwt');
  });

  it('deve lançar erro se senha for inválida', async () => {
    userRepo.findByEmail.mockResolvedValue({
      id: '1',
      email: 'teste@email.com',
      password: 'hash',
      profile: {
        id: 'p1',
        code: 'admin',
        name: 'Admin',
      },
    });
    bcrypt.compare.mockResolvedValue(false);

    await expect(useCase.execute('x', 'y')).rejects.toThrow();
  });
});
