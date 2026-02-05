import { PermissionUseCase } from '@application/use-cases/permission.use-case';
import { permissionRepositoryMock } from '../../domain/repository/permission.repository.mock';
import { userRepositoryMock } from '../../domain/repository/user.repository.mock';

describe('PermissionUseCase', () => {
  const permissionRepo = permissionRepositoryMock();
  const userRepo = userRepositoryMock();

  const useCase = new PermissionUseCase(userRepo, permissionRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return permissions when user exists', async () => {
    const userId = 'user-1';
    const profileId = 'profile-1';

    const fakePermissions = [
      { id: 'perm-1', code: 'USER_CREATE' },
      { id: 'perm-2', code: 'USER_DELETE' },
    ];

    userRepo.findById.mockResolvedValue({
      name: 'string',
      email: 'string',
      profileId: 'string',
      profile: {
        code: 'string',
        name: 'string',
      },
    });
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
    const userId = 'user-1';
    const profileId = 'profile-1';

    userRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(userId, profileId)).rejects.toThrow(
      'User not found',
    );

    expect(userRepo.findById).toHaveBeenCalledTimes(1);
    expect(userRepo.findById).toHaveBeenCalledWith(userId, profileId);

    expect(permissionRepo.getPermissions).not.toHaveBeenCalled();
  });
});
