export class Profile {
  id: string

  code: string

  name: string

  description: string

  createdAt?: Date;

  updateAt?: Date;

  constructor(input: Partial<Profile>) {
    this.id = input.id;
    this.name = input.name;
    this.code = input.code;
    this.description = input.description;
    this.createdAt = input.createdAt;
    this.updateAt = input.updateAt;
  }
}