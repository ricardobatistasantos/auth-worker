import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { Profile } from '@domain/entities/profile.entity';

@Injectable()
export class UserRepository {


  constructor(@Inject('DATABASE_CONNECTION') private readonly connection) { }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.connection().oneOrNone(`
      select
        u.id,
        u."name",
        u.email,
        u."password",
        u.profile_id,
        u.is_active,
        u.created_at,
        u.updated_at,
        p."name" name_profile,
        p.code code_profile,
	      p.description
      from
        users u
      inner join profile p on
        p.id = u.profile_id
      where
        u.email = $1
        and u.is_active is true;`, [email]);
        
    return user ? new User({
      id: user.id,
      name: user.name,
      email: user.email,
      profile: new Profile({
        id: user.profile_id,
        code: user.code_profile,
        name: user.name_profile,
        description: user.description,
      }),
      password: user.password,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }) : null;
  }

  async findById(userId: string, profileId: string): Promise<{
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
        AND p.id = $2
        AND u.is_active = true
      `,
      [userId, profileId],
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

}
