export class Role {

  id?: string

  name: string

  constructor(input: Role) {
    this.id = input.id
    this.name = input.name
  }
}