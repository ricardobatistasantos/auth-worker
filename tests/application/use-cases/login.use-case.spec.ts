import { LoginUseCase } from '@application/use-cases/login.use-case';
import { userRepositoryMock } from '../../domain/repository/user.repository.mock';
import { bcryptServiceMock } from '../../helpers/bcrypt.service.mock';
import { jwtServiceMock } from '../../token-service/jwt.service.mock';
import { Profile } from '@domain/entities/profile.entity';
import { User } from '@domain/entities/user.entity';

describe('LoginUseCase', () => {
  const userRepo = userRepositoryMock();
  const bcrypt = bcryptServiceMock();
  const jwt = jwtServiceMock();

  const useCase = new LoginUseCase(userRepo, jwt, bcrypt);

  const user = new User({
    id: '019c3087-13b2-7b1d-9f54-1d9860c7bd90',
    name: 'Ricardo Santos',
    email: 'teste@teste.com',
    password: 'hash',
    profile: new Profile({
      id: '019c3087-13b2-76d5-9996-11e04cbab655',
      code: 'admin',
      name: 'Admin',
    }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate the user with valid credentials', async () => {
    userRepo.findByEmail.mockResolvedValue(user);

    bcrypt.compare.mockResolvedValue(true);
    jwt.generateToken.mockReturnValue('token-jwt');

    const result = await useCase.execute('teste@email.com', '123456');

    expect(result.accessToken).toBe('token-jwt');
  });

  it('should throw error if password is invalid', async () => {
    userRepo.findByEmail.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    await expect(useCase.execute('x', 'y')).rejects.toThrow();
  });
});
