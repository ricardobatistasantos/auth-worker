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
  moduleCode: string;

  @Field()
  moduleName: string;

  @Field(() => [ActionDto])
  actions: ActionDto[];
}