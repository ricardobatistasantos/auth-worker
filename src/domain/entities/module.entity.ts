import { Action } from './action.entity';

export class Module {
  name: string;

  code: string;

  actions?: Action[];

  constructor(input: Partial<Module>) {
    this.name = input.name;
    this.code = input.code;
    this.actions = input.actions || [];
  }
}
