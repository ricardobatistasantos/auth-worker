import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class Role {
  @Field()
  id: string;

  @Field()
  name: string
}

@ObjectType()
export class User {
  @Field()
  id?: string;

  @Field()
  name: string;

  @Field()
  email: string;
  
  @Field(() => [Role])
  roles: Array<Role>;

  @Field()
  createdAt: string
}

@InputType()
export class CreateUserInput {
  @Field()
  name: string
  
  @Field()
  email: string
  
  @Field()
  password: string
  
  @Field()
  roleId: string
}

@ObjectType()
export class ResponseAuth {
  @Field()
  accessToken: string;
  
  @Field()
  user: User;
}