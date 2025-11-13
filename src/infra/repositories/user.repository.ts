import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@domain/entities/role.entity';
import { User } from '@domain/entities/user.entity';

@Injectable()
export class UserRepository {

  constructor(@Inject('DATABASE_CONNECTION') private readonly connection) { }
  
  async create(user: User): Promise<User> {
    const createdUser = await this.connection.one(
      'INSERT INTO users (name, email, "password") VALUES ($1, $2, $3) RETURNING *',
      [user.name, user.email, user.password]
    );
    return new User({ ...createdUser, createdAt: createdUser.created_at });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.connection.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    return user ? new User({ ...user, createdAt: user.created_at }) : null;
  }

  async createRelationsUserRoles(userId: string, roleId: string) {
    await this.connection.none(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
      [userId, roleId]
    );
  }

  async rolesByUser(userId: string): Promise<Array<Role>> {
    return await this.connection.manyOrNone(
      `SELECT r.* FROM roles r 
       JOIN user_roles ur ON r.id = ur.role_id 
       WHERE ur.user_id = $1`,
      [userId]
    );
  }
}