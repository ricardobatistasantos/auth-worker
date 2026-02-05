import { User } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<Partial<User> | null>;
  findById(
    userId: string,
    profileId: string,
  ): Promise<{
    name: string;
    email: string;
    profileId: string;
    profile: {
      code: string;
      name: string;
    };
  }>;
}
