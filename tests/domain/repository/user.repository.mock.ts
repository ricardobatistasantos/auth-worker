import { IUserRepository } from '@domain/repositories/user.repository';

export const userRepositoryMock = (): jest.Mocked<IUserRepository> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
});
