import { connectionMock } from '../../infra/database/pg-promise/connection.mock';
import { PermissionRepository } from '@infra/repositories/permission.repository';
import { PermissionUseCase } from '@application/use-cases/permission.use-case';
import { UserRepository } from '@infra/repositories/user.repository';
import { Profile } from '@domain/entities/profile.entity';
import { User } from '@domain/entities/user.entity';

describe('PermissionUseCase', () => {
  const userRepository = new UserRepository(connectionMock);
  const permissionRepository = new PermissionRepository(connectionMock);

  const useCase = new PermissionUseCase(userRepository, permissionRepository);

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

  it('should return permissions when user exists', async () => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
    jest
      .spyOn(permissionRepository, 'getPermissions')
      .mockResolvedValue(fakePermissions);

    const result = await useCase.execute(userId, profileId);

    expect(result).toEqual(fakePermissions);

    expect(userRepository.findById).toHaveBeenCalledTimes(1);
    expect(userRepository.findById).toHaveBeenCalledWith(userId, profileId);

    expect(permissionRepository.getPermissions).toHaveBeenCalledTimes(1);
    expect(permissionRepository.getPermissions).toHaveBeenCalledWith(
      userId,
      profileId,
    );
  });

  it('should throw error if user not found', async () => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(null);
    await expect(useCase.execute(userId, profileId)).rejects.toThrow(
      'User not found',
    );

    expect(userRepository.findById).toHaveBeenCalledTimes(1);
    expect(userRepository.findById).toHaveBeenCalledWith(userId, profileId);

    expect(permissionRepository.getPermissions).not.toHaveBeenCalled();
  });
});
