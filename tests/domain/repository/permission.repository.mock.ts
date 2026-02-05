import { IPermissionRepository } from '@domain/repositories/permission.repository';

export const permissionRepositoryMock =
  (): jest.Mocked<IPermissionRepository> => ({
    getPermissions: jest.fn(),
  });
