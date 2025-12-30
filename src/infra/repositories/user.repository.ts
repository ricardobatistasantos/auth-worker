import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';

@Injectable()
export class UserRepository {


  constructor(@Inject('DATABASE_CONNECTION') private readonly connection) { }

  async findById(userId: string): Promise<{
    name: string,
    email: string,
    profileId: string,
    profile: {
      code: string,
      name: string,
    },
  }> {
    const row = await this.connection().oneOrNone(`
      SELECT
        u.name,
        u.email,
        u.profile_id,
        p.code  AS profile_code,
        p.name  AS profile_name
      FROM users u
      JOIN profile p ON p.id = u.profile_id
      WHERE u.id = $1
        AND u.is_active = true
      `,
      [userId],
    );

    if (!row) return null;

    return {
      name: row.name,
      email: row.email,
      profileId: row.profile_id,
      profile: {
        code: row.profile_code,
        name: row.profile_name,
      },
    };
  }

  async create(user: User): Promise<User> {
    const created = await this.connection().oneOrNone(
      'INSERT INTO users ("name", email, profile_id, "password") VALUES ($1, $2, $3, $4) RETURNING *',
      [
        user.name,
        user.email,
        user.profileId,
        user.password
      ]
    );
    return new User({
      ...created,
      profileId: created.profile_id,
      createdAt: created.created_at
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.connection().oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    return user ? new User({
      id: user.id,
      name: user.name,
      email: user.email,
      profileId: user.profile_id,
      password: user.password,
      createdAt: user.created_at,
      updateAt: user.updated_at,
    }) : null;
  }
}