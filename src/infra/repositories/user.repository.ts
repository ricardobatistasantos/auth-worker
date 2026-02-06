import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { Profile } from '@domain/entities/profile.entity';
import { IUserRepository } from '@domain/repositories/user.repository';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@Inject('DATABASE_CONNECTION') private readonly connection) {}

  async findByEmail(email: string) {
    const user = await this.connection().oneOrNone(
      `select
        u.id,
        u."name",
        u.email,
        u."password",
        p.id profile_id,
        u.is_active,
        u.created_at,
        u.updated_at,
        p."name" name_profile,
        p.code code_profile,
              p.description
      from
        users u
      inner join user_profiles up on
        up.user_id = u.id
      inner join profile p on
        p.id = up.profile_id
      where
        u.email = $1
        and u.is_active is true;`,
      [email],
    );

    if (!user) return null;

    return new User({
      id: user.id,
      name: user.name,
      email: user.email,
      profile: new Profile({
        id: user.profile_id,
        code: user.code_profile,
        name: user.name_profile,
      }),
      password: user.password,
    });
  }

  async findById(userId: string, profileId: string) {
    const row = await this.connection().oneOrNone(
      `select
        u.name,
        u.email,
        p.id profile_id,
        p.code as profile_code,
        p.name as profile_name
      from
        users u
      join user_profiles up on
        u.id = up.user_id
      join profile p on
        p.id = up.profile_id
      where
        u.id = $1
        and p.id = $2
        and u.is_active = true`,
      [userId, profileId],
    );

    if (!row) return null;

    return new User({
      name: row.name,
      email: row.email,
      profile: new Profile({
        id: row.profile_id,
        code: row.profile_code,
        name: row.profile_name,
      }),
    });
  }
}
