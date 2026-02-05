export class Module {
  id?: string;

  name: string;

  code: string;

  description?: string;

  createdAt?: Date;

  updateAt?: Date;

  constructor(input: Partial<Module>) {
    this.id = input.id;
    this.name = input.name;
    this.code = input.code;
    this.description = input.description;
    this.createdAt = input.createdAt;
    this.updateAt = input.updateAt;
  }
}
