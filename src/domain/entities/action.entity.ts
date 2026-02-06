export class Action {
  name: string;

  code: string;

  constructor(input: Partial<Action>) {
    this.name = input.name;
    this.code = input.code;
  }
}
