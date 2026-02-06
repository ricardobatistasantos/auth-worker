import { Inject, Injectable } from '@nestjs/common';
import { IPermissionRepository } from '@domain/repositories/permission.repository';
import { Module } from '@domain/entities/module.entity';
import { Action } from '@domain/entities/action.entity';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(@Inject('DATABASE_CONNECTION') private readonly connection) {}

  async getPermissions(userId: string, profileId: string) {
    const row = await this.connection().manyOrNone(
      `with selected_user_profile as (
      select
        up.id as user_profile_id,
        up.user_id,
        p.id as profile_id,
        p.code as profile_code,
        p.name as profile_name
      from
        user_profiles up
      join profile p on p.id = up.profile_id
      where up.user_id = $1 and p.id = $2
      ),
      user_modules_cte as (
      select
        sup.profile_code,
        sup.profile_name,
        upm.id as user_profile_module_id,
        upm.module_id,
        m.code as module_code,
        m.name as module_name
      from
        user_profile_modules upm
      join selected_user_profile sup on sup.user_profile_id = upm.user_profile_id
      join modules m on m.id = upm.module_id
      ),
      user_permissions_cte as (
      select
        up.module_id,
        a.id as action_id,
        a.code as action_code,
        a.name as action_name
      from
        selected_user_profile sup
      join user_permissions up on sup.user_id = up.user_id
        and sup.profile_id = up.profile_id
      join actions a on a.id = up.action_id
      )
      select
        um.profile_code,
        um.profile_name,
        um.module_code,
        um.module_name,
        coalesce(
          json_agg(
            DISTINCT jsonb_build_object(
              'code', upc.action_code,
              'name', upc.action_name
            )
          ) FILTER (WHERE upc.action_code IS NOT NULL),
          '[]'::json
        ) as actions
      from
        user_modules_cte um
      left join user_permissions_cte upc on upc.module_id = um.module_id
      group by
        um.profile_code,
        um.profile_name,
        um.module_id,
        um.module_code,
        um.module_name
      order by
        um.module_code;`,
      [userId, profileId],
    );

    return row.map(
      (r) =>
        new Module({
          code: r.module_code,
          name: r.module_name,
          actions: r.actions.map(
            (a) =>
              new Action({
                code: a.code,
                name: a.name,
              }),
          ),
        }),
    );
  }
}
