import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PermissionRepository {

  constructor(@Inject('DATABASE_CONNECTION') private readonly connection) { }
  
  async permissionsByProfile(id: string) {
    const row = await this.connection().manyOrNone(`
      with profile_base as (
      select
      p.id as profile_id,
      p.code as profile_code,
      p.name as profile_name
      from
      profile p
      ),
      profile_modules_cte as (
        select
        pb.profile_id,
        pb.profile_code,
        pb.profile_name,
        m.id as module_id,
        m.code as module_code,
        m.name as module_name,
        pm.total_access,
        pm.id as profile_module_id
        from
        profile_base pb
        join profile_modules pm on
        pm.profile_id = pb.profile_id
        join modules m on
        m.id = pm.module_id
        ),
        profile_module_actions_cte as (
          select
          pm.profile_code,
          pm.module_code,
          a.code as action_code,
          a.name as action_name
          from
          profile_modules_cte pm
          join profile_module_actions pma on
          pma.profile_module_id = pm.profile_module_id
          join actions a on
          a.id = pma.action_id
          where
          pm.total_access = false
          )
          select
          pm.profile_code,
          pm.profile_name,
          pm.module_code,
          pm.module_name,
          pm.total_access,
          coalesce(
            json_agg(
              json_build_object(
                'code', pma.action_code,
                'name', pma.action_name
                )
                ) filter (where pma.action_code is not null),
                '[]'
                ) as actions
                from
                profile_modules_cte pm
                left join profile_module_actions_cte pma
                on pma.profile_code = pm.profile_code
                and pma.module_code = pm.module_code
                where
                pm.profile_id = $1
                group by
                pm.profile_id,
                pm.profile_code,
                pm.profile_name,
                pm.module_code,
                pm.module_name,
                pm.total_access
                order by
                pm.module_code;`, [id]);
                console.log(row)
                return row.map(r => ({
                  module: r.module_code,
                  moduleName: r.module_name,
                  totalAccess: r.total_access,
                  actions: r.actions.map(a => a.code),
                }));
              }
}
