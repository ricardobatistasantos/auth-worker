import { PermissionUseCase } from '@application/use-cases/permission.use-case';
import { permissionRepositoryMock } from '../../domain/repository/permission.repository.mock';
import { userRepositoryMock } from '../../domain/repository/user.repository.mock';
import { Profile } from '@domain/entities/profile.entity';
import { User } from '@domain/entities/user.entity';

describe('PermissionUseCase', () => {
  const permissionRepo = permissionRepositoryMock();
  const userRepo = userRepositoryMock();

  const useCase = new PermissionUseCase(userRepo, permissionRepo);

  const userId = '019c3087-13b2-7b1d-9f54-1d9860c7bd90';
  const profileId = '019c3087-13b2-76d5-9996-11e04cbab655';

  const user = new User({
    id: userId,
    name: 'Ricardo Santos',
    email: 'teste@teste.com',
    profile: new Profile({
      id: profileId,
      code: 'admin',
      name: 'Admin',
    }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return permissions when user exists', async () => {
    const fakePermissions = [
      {
        code: 'FIN',
        name: 'Financeiro',
        actions: [
          {
            code: 'CREATE',
            name: 'Criar',
          },
        ],
      },
      {
        code: 'HR',
        name: 'Recursos Humanos',
        actions: [
          {
            code: 'UPDATE',
            name: 'Atualizar',
          },
        ],
      },
    ];

    userRepo.findById.mockResolvedValue(user);
    permissionRepo.getPermissions.mockResolvedValue(fakePermissions);

    const result = await useCase.execute(userId, profileId);

    expect(result).toEqual(fakePermissions);

    expect(userRepo.findById).toHaveBeenCalledTimes(1);
    expect(userRepo.findById).toHaveBeenCalledWith(userId, profileId);

    expect(permissionRepo.getPermissions).toHaveBeenCalledTimes(1);
    expect(permissionRepo.getPermissions).toHaveBeenCalledWith(
      userId,
      profileId,
    );
  });

  it('should throw error if user not found', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(userId, profileId)).rejects.toThrow(
      'User not found',
    );

    expect(userRepo.findById).toHaveBeenCalledTimes(1);
    expect(userRepo.findById).toHaveBeenCalledWith(userId, profileId);

    expect(permissionRepo.getPermissions).not.toHaveBeenCalled();
  });
});
