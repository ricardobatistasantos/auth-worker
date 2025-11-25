import { Module } from "./module.entity";

export class User {

  id?: string;

  name: string;

  email: string;

  password?: string;

  modules?: Module[];

  createdAt?: Date;

  updateAt?: Date;

  constructor(input: Partial<User>) {
    this.id = input.id;
    this.name = input.name;
    this.email = input.email;
    this.password = input.password;
    this.modules = input.modules;
    this.createdAt = input.createdAt;
    this.updateAt = input.updateAt;
  }
}
