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

-- INSERT INTO DATA ------------------------------------------------------------------
-- =====================================================
-- USERS
-- =====================================================
INSERT INTO users (name, email, password, is_active)
VALUES
('User Admin','admin@email.com','123', true),
('User Financeiro','financeiro@email.com','123', true),
('User Comercial','comercial@email.com','123', true),
('User Estoque','estoque@email.com','123', true),
('User Fiscal','fiscal@email.com','123', true),
('User RH','rh@email.com','123', true),
('User Suporte','suporte@email.com','123', true),
('User Gestor','gestor@email.com','123', true),
('User Auditor','auditor@email.com','123', true),
('User Visitante','visitante@email.com','123', true);

-- =====================================================
-- PROFILES
-- =====================================================
INSERT INTO profile (code, name) VALUES
('ADMIN','Administrador'),
('FIN','Financeiro'),
('COM','Comercial'),
('EST','Estoque'),
('FISC','Fiscal'),
('RH','Recursos Humanos'),
('SUP','Suporte'),
('GEST','Gestor'),
('AUD','Auditor'),
('VIEW','Visualização');

-- =====================================================
-- MODULES
-- =====================================================
INSERT INTO modules (code, name) VALUES
('USERS','Usuários'),
('FIN','Financeiro'),
('SALES','Vendas'),
('STOCK','Estoque'),
('TAX','Fiscal'),
('HR','Recursos Humanos'),
('REPORTS','Relatórios');

-- =====================================================
-- ACTIONS
-- =====================================================
INSERT INTO actions (code, name) VALUES
('CREATE','Criar'),
('READ','Visualizar'),
('UPDATE','Atualizar'),
('DELETE','Excluir'),
('EXPORT','Exportar');

-- =====================================================
-- USER ↔ PROFILE
-- =====================================================
INSERT INTO user_profiles (user_id, profile_id)
SELECT u.id, p.id
FROM users u
JOIN profile p ON
(
  (u.email = 'admin@email.com' AND p.code = 'ADMIN') OR
  (u.email = 'financeiro@email.com' AND p.code = 'FIN') OR
  (u.email = 'comercial@email.com' AND p.code = 'COM') OR
  (u.email = 'estoque@email.com' AND p.code = 'EST') OR
  (u.email = 'fiscal@email.com' AND p.code = 'FISC') OR
  (u.email = 'rh@email.com' AND p.code = 'RH') OR
  (u.email = 'suporte@email.com' AND p.code = 'SUP') OR
  (u.email = 'gestor@email.com' AND p.code = 'GEST') OR
  (u.email = 'auditor@email.com' AND p.code = 'AUD') OR
  (u.email = 'visitante@email.com' AND p.code = 'VIEW')
);

INSERT INTO user_profile_modules (user_profile_id, module_id)
SELECT up.id, m.id
FROM user_profiles up
JOIN profile p ON p.id = up.profile_id
JOIN modules m ON
(
    -- ADMIN → tudo
    (p.code = 'ADMIN')
    -- Financeiro
    OR (p.code = 'FIN' AND m.code IN ('FIN','REPORTS'))
    -- Comercial
    OR (p.code = 'COM' AND m.code IN ('SALES','REPORTS'))
    -- Estoque
    OR (p.code = 'EST' AND m.code IN ('STOCK'))
    -- Fiscal
    OR (p.code = 'FISC' AND m.code IN ('TAX','REPORTS'))
    -- RH
    OR (p.code = 'RH' AND m.code IN ('HR'))
    -- Suporte
    OR (p.code = 'SUP' AND m.code IN ('USERS'))
    -- Gestor
    OR (p.code = 'GEST' AND m.code IN ('FIN','SALES','REPORTS'))
    -- Auditor
    OR (p.code = 'AUD' AND m.code IN ('REPORTS'))
    -- Visitante
    OR (p.code = 'VIEW' AND m.code IN ('REPORTS'))
);

INSERT INTO user_profile_module_actions (user_profile_module_id, action_id)
SELECT upm.id, a.id
FROM user_profile_modules upm
JOIN actions a ON
(
    -- Admin: tudo
    EXISTS (
        SELECT 1 FROM profile p
        WHERE p.id = (
            SELECT profile_id FROM user_profiles up WHERE up.id = upm.user_profile_id
        )
        AND p.code = 'ADMIN'
    )
    -- Visitante e Auditor → somente leitura
    OR (
        a.code = 'READ'
        AND EXISTS (
            SELECT 1 FROM profile p
            WHERE p.id = (
                SELECT profile_id FROM user_profiles up WHERE up.id = upm.user_profile_id
            )
            AND p.code IN ('VIEW','AUD')
        )
    )
    -- Demais perfis → CRUD completo
    OR (
        a.code IN ('CREATE','READ','UPDATE','DELETE')
        AND EXISTS (
            SELECT 1 FROM profile p
            WHERE p.id = (
                SELECT profile_id FROM user_profiles up WHERE up.id = upm.user_profile_id
            )
            AND p.code NOT IN ('VIEW','AUD')
        )
    )
);

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