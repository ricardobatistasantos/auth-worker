import { Field, ObjectType } from "@nestjs/graphql";

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
  module: string;

  @Field()
  moduleName: string;

  @Field()
  totalAccess: boolean;

  @Field(() => [ActionDto])
  actions: ActionDto[];
}