```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE DATABASE erp_auth;

create table if not exists users (
id uuid primary key default gen_random_uuid(),
	"name" varchar(150) not null,
	email varchar(254) unique,
	password varchar(255) not null,
	profile_id uuid not null references profile(id),
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists profile (
	id uuid primary key default gen_random_uuid(),
	code varchar(100) not null unique,
	name varchar(200) not null,
	description text,
	created_at timestamptz not null default now()
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  code varchar(80) not null unique,
  name varchar(200) not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  code varchar(120) not null unique,-- ex: FIN_CREATE_INVOICE, CLIENT_CREATE
name varchar(200) not null,
  description text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS profile_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  total_access boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, module_id)
);

-- quando total_access = false, use esta tabela para enumerar as actions permitidas para o profile+module
CREATE TABLE IF NOT EXISTS profile_module_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_module_id uuid NOT NULL REFERENCES profile_modules(id) ON DELETE CASCADE,
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  UNIQUE(profile_module_id, action_id)
);

CREATE TYPE permission_effect AS ENUM ('grant','deny');
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  action_id uuid NULL REFERENCES actions(id) ON DELETE CASCADE, -- NULL quando for referência a TOTAL_ACCESS
  effect permission_effect NOT NULL DEFAULT 'grant',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id, action_id)
);

INSERT INTO profile (id, code, name, description) VALUES
('6a14bc63-f19c-4f71-a953-61d53f5137fa', 'ADMIN', 'Administrador Geral', 'Acesso total ao sistema, incluindo configurações e todos os módulos.'),-- Perfil Administrador Geral
('c3ea7cd1-9d85-4f25-9ecd-8e83db3dd4ef', 'FINANCE', 'Financeiro', 'Acesso ao módulo financeiro: contas a pagar, contas a receber, fluxo de caixa e relatórios.'),-- Perfil Financeiro
('f1ad2bc7-922f-4c95-8ae0-8dd13a8b9630', 'FISCAL', 'Fiscal / Contábil', 'Acesso às rotinas fiscais e obrigações acessórias, como notas, impostos e SPED.'),-- Perfil Contábil / Fiscal
('e6bc8b2d-7f2f-41a1-a53a-1a5118270b83', 'PURCHASE', 'Compras / Suprimentos', 'Acesso ao módulo de suprimentos, requisições, ordens de compra e fornecedores.'),-- Perfil Suprimentos / Compras
('a07c0bf9-96b8-4ea7-bf4e-1f8aafff8d34', 'SALES', 'Vendas / Comercial', 'Acesso ao módulo comercial, pedidos, orçamentos e clientes.'),-- Perfil Comercial / Vendas
('d4b98cd6-1e20-4a2b-b651-3092a3e4f44f', 'HR', 'Recursos Humanos', 'Acesso ao módulo de pessoas: colaboradores, cargos, departamentos e ponto.'),-- Perfil Pessoas / RH
('8f4d6a60-bd9b-4d19-ad4f-e223ed52c0b7', 'LOGISTICS', 'Logística', 'Acesso a estoque, armazém, expedição e rastreamento.'),-- Perfil Logística
('9d4cd814-603b-42bb-aafd-61df0cc7d91a', 'PRODUCTION', 'Produção', 'Acesso às ordens de produção, chão de fábrica e estrutura de produtos.'),-- Perfil Produção
('bb18d61c-c779-401d-a2aa-37bcad63b7b1', 'BANKING', 'Bancário', 'Acesso a cadastros bancários, contas, agências e integrações financeiras.'),-- Perfil Bancário
('d950cf9d-3221-4b61-bf62-982d053f38fa', 'IT_SUPPORT', 'TI / Suporte', 'Acesso ao gerenciamento técnico, permissões, logs e monitoramento.'),-- Perfil TI / Suporte
('ef402ac1-99c4-4b4e-9f68-9240bdb1e415', 'MANAGER', 'Gestor / Diretoria', 'Acesso gerencial a dashboards, KPIs e relatórios globais.'),-- Perfil Gestor (Diretoria)
('27d8f6da-c35a-4c56-b02e-0eafdcd4d02e', 'OPERATOR', 'Operador', 'Acesso limitado às operações básicas do módulo designado.');-- Perfil Operador (restrito)


INSERT INTO modules (id, code, name, description) VALUES
-- Administrativo
(gen_random_uuid(), 'ADMIN', 'Administrativo', 'Configurações gerais do sistema'),
-- Cadastros
(gen_random_uuid(), 'CADASTRO', 'Cadastros', 'Cadastros básicos do ERP'),
-- Pessoas
(gen_random_uuid(), 'PESSOAS', 'Pessoas', 'Gestão de pessoas físicas e jurídicas'),
-- Financeiro
(gen_random_uuid(), 'FINANCEIRO', 'Financeiro', 'Contas, recebimentos e pagamentos'),
-- Fiscal
(gen_random_uuid(), 'FISCAL', 'Fiscal', 'Documentos fiscais e tributos'),
-- Comercial
(gen_random_uuid(), 'COMERCIAL', 'Comercial', 'Vendas, pedidos e clientes'),
-- Logística
(gen_random_uuid(), 'LOGISTICA', 'Logística', 'Estoque, transporte e entregas'),
-- Bancário
(gen_random_uuid(), 'BANCARIO', 'Bancário', 'Contas bancárias, conciliações'),
-- Relatórios
(gen_random_uuid(), 'RELATORIOS', 'Relatórios', 'Relatórios gerenciais'),
-- Segurança
(gen_random_uuid(), 'SEGURANCA', 'Segurança', 'Perfis, usuários e permissões');

-- Pessoas
INSERT INTO actions (id, code, name, description) VALUES
(gen_random_uuid(), 'PESSOA_CREATE', 'Criar Pessoa', 'Criar pessoa física ou jurídica'),
(gen_random_uuid(), 'PESSOA_UPDATE', 'Editar Pessoa', 'Editar dados da pessoa'),
(gen_random_uuid(), 'PESSOA_DELETE', 'Excluir Pessoa', 'Excluir pessoa'),
(gen_random_uuid(), 'PESSOA_VIEW', 'Visualizar Pessoa', 'Consultar dados da pessoa');

-- Cliente
INSERT INTO actions (id, code, name, description) VALUES
(gen_random_uuid(), 'CLIENT_CREATE', 'Criar Cliente', 'Cadastrar cliente'),
(gen_random_uuid(), 'CLIENT_UPDATE', 'Editar Cliente', 'Editar cliente'),
(gen_random_uuid(), 'CLIENT_DELETE', 'Excluir Cliente', 'Excluir cliente'),
(gen_random_uuid(), 'CLIENT_VIEW', 'Visualizar Cliente', 'Consultar cliente');

-- Financeiro
INSERT INTO actions (id, code, name, description) VALUES
(gen_random_uuid(), 'FIN_ACCOUNT_CREATE', 'Criar Conta Financeira', 'Criar conta financeira'),
(gen_random_uuid(), 'FIN_ACCOUNT_UPDATE', 'Editar Conta Financeira', 'Editar conta financeira'),
(gen_random_uuid(), 'FIN_ACCOUNT_DELETE', 'Excluir Conta Financeira', 'Excluir conta financeira'),
(gen_random_uuid(), 'FIN_RECEIVE', 'Registrar Recebimento', 'Registrar recebimento'),
(gen_random_uuid(), 'FIN_PAY', 'Registrar Pagamento', 'Registrar pagamento'),
(gen_random_uuid(), 'FIN_VIEW', 'Visualizar Financeiro', 'Consultar dados financeiros');

-- Bancario
INSERT INTO actions (id, code, name, description) VALUES
(gen_random_uuid(), 'BANK_ACCOUNT_CREATE', 'Criar Conta Bancária', 'Criar conta bancária'),
(gen_random_uuid(), 'BANK_ACCOUNT_UPDATE', 'Editar Conta Bancária', 'Editar conta bancária'),
(gen_random_uuid(), 'BANK_ACCOUNT_DELETE', 'Excluir Conta Bancária', 'Excluir conta bancária'),
(gen_random_uuid(), 'BANK_CONCILIATION', 'Conciliação Bancária', 'Executar conciliação bancária');

-- Fiscal
INSERT INTO actions (id, code, name, description) VALUES
(gen_random_uuid(), 'FISCAL_NFE_EMIT', 'Emitir NF-e', 'Emitir nota fiscal eletrônica'),
(gen_random_uuid(), 'FISCAL_NFE_CANCEL', 'Cancelar NF-e', 'Cancelar nota fiscal'),
(gen_random_uuid(), 'FISCAL_VIEW', 'Visualizar Fiscal', 'Consultar dados fiscais');

-- Comercial
INSERT INTO actions (id, code, name, description) VALUES
(gen_random_uuid(), 'SALE_ORDER_CREATE', 'Criar Pedido de Venda', 'Criar pedido'),
(gen_random_uuid(), 'SALE_ORDER_UPDATE', 'Editar Pedido de Venda', 'Editar pedido'),
(gen_random_uuid(), 'SALE_ORDER_CANCEL', 'Cancelar Pedido', 'Cancelar pedido'),
(gen_random_uuid(), 'SALE_ORDER_VIEW', 'Visualizar Pedido', 'Consultar pedidos');

-- Segurança (usuários / perfis)
INSERT INTO actions (id, code, name, description) VALUES
(gen_random_uuid(), 'USER_CREATE', 'Criar Usuário', 'Criar usuário'),
(gen_random_uuid(), 'USER_UPDATE', 'Editar Usuário', 'Editar usuário'),
(gen_random_uuid(), 'USER_DELETE', 'Excluir Usuário', 'Excluir usuário'),
(gen_random_uuid(), 'PROFILE_MANAGE', 'Gerenciar Perfis', 'Criar e editar perfis e permissões');


-- PERFIL ADMIN -> acesso total a todos os módulos 
INSERT INTO profile_modules (profile_id, module_id, total_access) SELECT '6a14bc63-f19c-4f71-a953-61d53f5137fa', m.id, true FROM modules m ON CONFLICT DO NOTHING;

-- PERFIL MANAGER -> acesso total aos módulos de negócio
 INSERT INTO profile_modules (profile_id, module_id, total_access) VALUES 
 -- FINANCE
  ('ef402ac1-99c4-4b4e-9f68-9240bdb1e415', '9e6fa69e-8c31-45f9-9cc2-ceea6b781c18', true), 
  -- FISCAL 
  ('ef402ac1-99c4-4b4e-9f68-9240bdb1e415', '7b16244a-f509-404c-9d41-e23fce9acae7', true), 
  -- COMERCIAL 
  ('ef402ac1-99c4-4b4e-9f68-9240bdb1e415', 'd357c778-3e20-43d3-91d8-812926a870e6', true), 
  -- LOGISTICA 
  ('ef402ac1-99c4-4b4e-9f68-9240bdb1e415', 'c64fa3b1-7123-4c05-9f19-fea3fec96156', true), 
  -- BANCARIO 
  ('ef402ac1-99c4-4b4e-9f68-9240bdb1e415', 'b708e527-fb9b-4c4d-a144-ad4fd99dd7e8', true) ON CONFLICT DO NOTHING;

-- PERFIL OPERATOR -> acesso limitado (sem total_access) 
INSERT INTO profile_modules (profile_id, module_id, total_access) VALUES ('27d8f6da-c35a-4c56-b02e-0eafdcd4d02e', '9e6fa69e-8c31-45f9-9cc2-ceea6b781c18', false), 
-- FINANCEIRO 
('27d8f6da-c35a-4c56-b02e-0eafdcd4d02e', 'd357c778-3e20-43d3-91d8-812926a870e6', false), 
-- COMERCIAL 
('27d8f6da-c35a-4c56-b02e-0eafdcd4d02e', 'c64fa3b1-7123-4c05-9f19-fea3fec96156', false) -- LOGISTICA 
ON CONFLICT DO NOTHING;

-- PERFIS SETORIAIS -> cada perfil com acesso total ao seu módulo principal 
INSERT INTO profile_modules (profile_id, module_id, total_access) VALUES ('c3ea7cd1-9d85-4f25-9ecd-8e83db3dd4ef', '9e6fa69e-8c31-45f9-9cc2-ceea6b781c18', true), 
-- FINANCE -> FINANCEIRO 
('f1ad2bc7-922f-4c95-8ae0-8dd13a8b9630', '7b16244a-f509-404c-9d41-e23fce9acae7', true), 
-- FISCAL -> FISCAL 
('e6bc8b2d-7f2f-41a1-a53a-1a5118270b83', 'd357c778-3e20-43d3-91d8-812926a870e6', true), 
-- PURCHASE -> COMERCIAL 
('a07c0bf9-96b8-4ea7-bf4e-1f8aafff8d34', 'd357c778-3e20-43d3-91d8-812926a870e6', true), 
-- SALES -> COMERCIAL 
('d4b98cd6-1e20-4a2b-b651-3092a3e4f44f', 'a55fd7bc-0423-4696-9e26-f4042521f402', true), 
-- HR -> PESSOAS 
('8f4d6a60-bd9b-4d19-ad4f-e223ed52c0b7', 'c64fa3b1-7123-4c05-9f19-fea3fec96156', true), 
-- LOGISTICS -> LOGISTICA 
('9d4cd814-603b-42bb-aafd-61df0cc7d91a', '9e6fa69e-8c31-45f9-9cc2-ceea6b781c18', true), 
-- PRODUCTION -> FINANCEIRO (ajuste se necessário) 
('bb18d61c-c779-401d-a2aa-37bcad63b7b1', 'b708e527-fb9b-4c4d-a144-ad4fd99dd7e8', true), 
-- BANKING -> BANCARIO 
('d950cf9d-3221-4b61-bf62-982d053f38fa', 'e7f9ab5a-8b30-4304-a932-76e62dae4fe4', true) -- IT_SUPPORT -> SEGURANCA 
ON CONFLICT DO NOTHING;


-- ===============================
-- PESSOAS / CADASTRO
-- ===============================
INSERT INTO profile_module_actions (profile_module_id, action_id)
SELECT
  pm.id,
  a.id
FROM profile_modules pm
JOIN modules m ON m.id = pm.module_id
JOIN actions a ON a.code IN (
  'PESSOA_CREATE',
  'PESSOA_UPDATE',
  'PESSOA_DELETE',
  'PESSOA_VIEW',
  'CLIENT_CREATE',
  'CLIENT_UPDATE',
  'CLIENT_DELETE',
  'CLIENT_VIEW'
)
WHERE
  m.code IN ('PESSOAS', 'CADASTRO')
  AND pm.total_access = false
ON CONFLICT DO NOTHING;

-- ===============================
-- FINANCEIRO
-- ===============================
INSERT INTO profile_module_actions (profile_module_id, action_id)
SELECT
  pm.id,
  a.id
FROM profile_modules pm
JOIN modules m ON m.id = pm.module_id
JOIN actions a ON a.code IN (
  'FIN_ACCOUNT_CREATE',
  'FIN_ACCOUNT_UPDATE',
  'FIN_ACCOUNT_DELETE',
  'FIN_RECEIVE',
  'FIN_PAY',
  'FIN_VIEW'
)
WHERE
  m.code = 'FINANCEIRO'
  AND pm.total_access = false
ON CONFLICT DO NOTHING;

-- ===============================
-- BANCARIO
-- ===============================
INSERT INTO profile_module_actions (profile_module_id, action_id)
SELECT
  pm.id,
  a.id
FROM profile_modules pm
JOIN modules m ON m.id = pm.module_id
JOIN actions a ON a.code IN (
  'BANK_ACCOUNT_CREATE',
  'BANK_ACCOUNT_UPDATE',
  'BANK_ACCOUNT_DELETE',
  'BANK_CONCILIATION'
)
WHERE
  m.code = 'BANCARIO'
  AND pm.total_access = false
ON CONFLICT DO NOTHING;

-- ===============================
-- FISCAL
-- ===============================
INSERT INTO profile_module_actions (profile_module_id, action_id)
SELECT
  pm.id,
  a.id
FROM profile_modules pm
JOIN modules m ON m.id = pm.module_id
JOIN actions a ON a.code IN (
  'FISCAL_NFE_EMIT',
  'FISCAL_NFE_CANCEL',
  'FISCAL_VIEW'
)
WHERE
  m.code = 'FISCAL'
  AND pm.total_access = false
ON CONFLICT DO NOTHING;

-- ===============================
-- COMERCIAL / VENDAS
-- ===============================
INSERT INTO profile_module_actions (profile_module_id, action_id)
SELECT
  pm.id,
  a.id
FROM profile_modules pm
JOIN modules m ON m.id = pm.module_id
JOIN actions a ON a.code IN (
  'SALE_ORDER_CREATE',
  'SALE_ORDER_UPDATE',
  'SALE_ORDER_CANCEL',
  'SALE_ORDER_VIEW'
)
WHERE
  m.code = 'COMERCIAL'
  AND pm.total_access = false
ON CONFLICT DO NOTHING;

-- ===============================
-- ADMIN / SEGURANCA
-- ===============================
INSERT INTO profile_module_actions (profile_module_id, action_id)
SELECT
  pm.id,
  a.id
FROM profile_modules pm
JOIN modules m ON m.id = pm.module_id
JOIN actions a ON a.code IN (
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DELETE',
  'PROFILE_MANAGE'
)
WHERE
  m.code IN ('ADMIN', 'SEGURANCA')
  AND pm.total_access = false
ON CONFLICT DO NOTHING;


-- Gerentes por módulo
INSERT INTO users (id, name, email, password, profile_id, created_at)
VALUES
-- ADMIN
(gen_random_uuid(), 'Gerente ADMIN', 'admin@erp.com.br', 'manager123', 'ef402ac1-99c4-4b4e-9f68-9240bdb1e415', now()),
-- CADASTRO
(gen_random_uuid(), 'Gerente CADASTRO', 'cadastro@erp.com.br', 'manager123', 'ef402ac1-99c4-4b4e-9f68-9240bdb1e415', now()),
-- PESSOAS
(gen_random_uuid(), 'Gerente PESSOAS', 'pessoas@erp.com.br', 'manager123', 'ef402ac1-99c4-4b4e-9f68-9240bdb1e415', now()),
-- FINANCEIRO
(gen_random_uuid(), 'Gerente FINANCEIRO', 'financeiro@erp.com.br', 'manager123', 'ef402ac1-99c4-4b4e-9f68-9240bdb1e415', now()),
-- FISCAL
(gen_random_uuid(), 'Gerente FISCAL', 'fiscal@erp.com.br', 'manager123', 'ef402ac1-99c4-4b4e-9f68-9240bdb1e415', now()),
-- COMERCIAL
(gen_random_uuid(), 'Gerente COMERCIAL', 'comercial@erp.com.br', 'manager123', 'ef402ac1-99c4-4b4e-9f68-9240bdb1e415', now()),
-- LOGISTICA
(gen_random_uuid(), 'Gerente LOGISTICA', 'logistica@erp.com.br', 'manager123', 'ef402ac1-99c4-4b4e-9f68-9240bdb1e415', now()),
-- BANCARIO
(gen_random_uuid(), 'Gerente BANCARIO', 'bancario@erp.com.br', 'manager123', 'ef402ac1-99c4-4b4e-9f68-9240bdb1e415', now()),
-- RELATORIOS
(gen_random_uuid(), 'Gerente RELATORIOS', 'relatorios@erp.com.br', 'manager123', 'ef402ac1-99c4-4b4e-9f68-9240bdb1e415', now()),
-- SEGURANCA
(gen_random_uuid(), 'Gerente SEGURANCA', 'seguranca@erp.com.br', 'manager123', 'ef402ac1-99c4-4b4e-9f68-9240bdb1e415', now());
```

