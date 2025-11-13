import { Role } from "./role.entity";

export class User {

  id?: string;

  name: string;

  email: string;

  password?: string;

  roles?: Role;

  createdAt?: Date;

  updateAt?: Date;

  constructor(input: Partial<User>) {
    this.id = input.id;
    this.name = input.name;
    this.email = input.email;
    this.password = input.password;
    this.roles = input.roles;
    this.createdAt = input.createdAt;
    this.updateAt = input.updateAt;
  }
}
