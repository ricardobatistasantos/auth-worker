```sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_name varchar(150) NOT NULL UNIQUE,
email varchar(254) UNIQUE,
password varchar(255) NOT NULL,
profile_id uuid REFERENCES profile(id),
is_active boolean NOT NULL DEFAULT true,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (lower(username));
CREATE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));

CREATE TABLE IF NOT EXISTS modules (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
code varchar(80) NOT NULL UNIQUE,
name varchar(200) NOT NULL,
description text,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS actions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
code varchar(80) NOT NULL UNIQUE,
name varchar(200) NOT NULL,
description text,
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
code varchar(100) NOT NULL UNIQUE,
name varchar(200) NOT NULL,
description text,
created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS templates_profile (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
profile_id uuid NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
created_at timestamptz NOT NULL DEFAULT now(),
UNIQUE(profile_id, module_id, action_id)
);

CREATE INDEX IF NOT EXISTS idx_templates_profile_profile ON templates_profile (profile_id);
CREATE INDEX IF NOT EXISTS idx_templates_profile_module ON templates_profile (module_id);

INSERT INTO profile (code, name, description)
VALUES ('super_admin','Super Admim', 'Perfil com acesso total ao sistema')
RETURNING id;

INSERT INTO users (user_name, email, password, profile_id)
VALUES (
  'super_admin',
  'admin@erp.com',
  '$2b$10$V2QzK7y7lV1Gz2W7b0/NpO9WSVZ8nF2sa3e8hGQjAxJQh0P7JqZea', -- admin123
  'bc96aaa7-6f8f-4dc8-bdca-87430cccc9ea'
);

INSERT INTO actions (code, name) VALUES
('READ','Consultar'),
('CREATE','Cadastrar'),
('UPDATE','Editar'),
('DELETE','Deletar')
ON CONFLICT (code) DO NOTHING;

ORDER BY m.code, a.code;
```