import { User } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<Partial<User> | null>;
  findById(userId: string, profileId: string): Promise<Partial<User> | null>;
}
