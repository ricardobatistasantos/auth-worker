import { Entity } from "./entity.base";
import { Profile } from "./profile.entity";

export class User extends Entity {

  name: string;

  email: string;

  password?: string;

  profile?: Profile;

  constructor(input: Partial<User>) {

    super(input);

    this.name = input.name;
    this.email = input.email;
    this.password = input.password;
    this.profile = new Profile({
      id: input.profile?.id,
      code: input.profile.code,
      name: input.profile.name,
      description: input.profile.description,
    });
  }
}
