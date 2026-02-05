import { BcryptService } from '@helpers/bcrypt.service';

export const bcryptServiceMock = (): jest.Mocked<BcryptService> => ({
  hash: jest.fn(),
  compare: jest.fn(),
});
