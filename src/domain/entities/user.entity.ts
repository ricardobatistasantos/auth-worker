export class User {

  id?: string;

  name: string;

  email: string;

  password?: string;

  profileId?: string;

  createdAt?: Date;

  updateAt?: Date;

  constructor(input: Partial<User>) {
    this.id = input.id;
    this.name = input.name;
    this.email = input.email;
    this.password = input.password;
    this.profileId = input.profileId;
    this.createdAt = input.createdAt;
    this.updateAt = input.updateAt;
  }
}
