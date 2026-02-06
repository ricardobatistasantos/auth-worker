export class Entity {
  id?: string;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(input: Entity) {
    this.id = input.id;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
}
