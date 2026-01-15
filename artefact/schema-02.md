```sql
-- =========================================================
-- EXTENSÕES
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- DATABASE
-- =========================================================
CREATE DATABASE erp_auth;

-- =========================================================
-- USERS
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(150) NOT NULL,
  email varchar(254) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- PROFILE
-- =========================================================
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(100) NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- USER ↔ PROFILE (N:N)
-- =========================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, profile_id)
);

-- =========================================================
-- MODULES
-- =========================================================
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(80) NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- ACTIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(120) NOT NULL UNIQUE, -- ex: FIN_CREATE_INVOICE
  name varchar(200) NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- PROFILE ↔ MODULE
-- =========================================================
CREATE TABLE IF NOT EXISTS user_profile_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_profile_id, module_id)
);

-- =========================================================
-- PROFILE ↔ MODULE ↔ ACTION
-- =========================================================
CREATE TABLE IF NOT EXISTS user_profile_module_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_module_id uuid NOT NULL REFERENCES user_profile_modules(id) ON DELETE CASCADE,
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  UNIQUE(user_profile_module_id, action_id)
);

-- =========================================================
-- USER PERMISSION OVERRIDE
-- =========================================================

CREATE TABLE user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, profile_id, module_id, action_id)
);
-- =========================================================
-- ÍNDICES (Performance)
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile ON user_profiles(profile_id);

CREATE INDEX IF NOT EXISTS idx_profile_modules_profile ON profile_modules(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_modules_module ON profile_modules(module_id);

CREATE INDEX IF NOT EXISTS idx_pma_profile_module ON profile_module_actions(profile_module_id);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_module ON user_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_action ON user_permissions(action_id);


with selected_user_profile as (
      select
        up.id as user_profile_id,
        up.user_id,
        p.id as profile_id,
        p.code as profile_code,
        p.name as profile_name
      from
        user_profiles up
      join profile p on
        p.id = up.profile_id
      where
        up.user_id = $1
        and p.id = $2
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
      join selected_user_profile sup on
        sup.user_profile_id = upm.user_profile_id
      join modules m on
        m.id = upm.module_id
      ),
      user_permissions_cte as (
      select
        up.module_id,
        a.id as action_id,
        a.code as action_code,
        a.name as action_name
      from
        selected_user_profile sup
      join user_permissions up on
        sup.user_id = up.user_id
        and sup.profile_id = up.profile_id
      join actions a on
        a.id = up.action_id
      )
      select
        um.profile_code,
        um.profile_name,
        um.module_code,
        um.module_name,
        coalesce(
          json_agg(
              distinct json_build_object(
                  'code',
        upc.action_code,
        'name',
        upc.action_name
              )::text
          ) filter (
      where
        upc.action_code is not null),
        '[]'::json
      )::json as actions
      from
        user_modules_cte um
      left join user_permissions_cte upc on
        upc.module_id = um.module_id
      group by
        um.profile_code,
        um.profile_name,
        um.module_id,
        um.module_code,
        um.module_name
      order by
        um.module_code;
```