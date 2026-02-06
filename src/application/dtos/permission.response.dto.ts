import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActionDto {
  @Field()
  code: string;

  @Field()
  name: string;
}

@ObjectType()
export class PermissionDto {
  @Field()
  code: string;

  @Field()
  name: string;

  @Field(() => [ActionDto])
  actions: ActionDto[];
}
