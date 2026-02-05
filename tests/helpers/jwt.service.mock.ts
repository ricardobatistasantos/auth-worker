import { ITokenService } from '@application/contracts/jwt.service.interface';

export const jwtServiceMock = (): jest.Mocked<ITokenService> => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
});
