# SISTEMA DE LOGIN E PERMISSÃO COM GRAPHQL

TECNOLOGIAS

GRaphql, NestJs, Postgres, Jsonwebtoken

AÇÔES
  Usuários
    Cadastro, Update, Delete, Inativar, Login

  Módulos
    Cadastro, Update, Delete, Listar, Listar por

  Perfil
    Cadastro, Update, Delete, Listar, Listar por

TABELAS
  Usuários, Modulos, Ações, Template, Perfil, Modulos_Usuário, Ações_Usuário

  user: id, name, email, password, perfil_id
  profile: id, name, time_expires
  profile_module, id, module_id, profile_id, time_expires
  profile_module_action: id, profile_module_id, user_id, module_id, action_id
  template_module_profile: id, module_id, profile_id, time_expires
  module: id, name
  action: id, name, module_id