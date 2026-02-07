export const connectionMock = jest.fn(() => ({
  oneOrNone: jest.fn(),
  manyOrNone: jest.fn(),
}));
