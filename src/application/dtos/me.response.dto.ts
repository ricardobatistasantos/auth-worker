import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProfileDto {

  @Field()
  code: string;

  @Field()
  name: string;
}

@ObjectType()
export class ModulePermissionDto {

  @Field()
  module: string;

  @Field()
  moduleName: string;

  @Field()
  totalAccess: boolean;

  @Field(() => [String], { nullable: true })
  actions?: string[];
}

@ObjectType()
export class MeDto {

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => ProfileDto)
  profile: ProfileDto;

  @Field(() => [ModulePermissionDto])
  permissions: ModulePermissionDto[];
}