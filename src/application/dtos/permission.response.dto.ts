import { Field, ObjectType } from "@nestjs/graphql";
import { ProfileDto } from "./profile.dto";

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
export class PermissionDto {

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => ProfileDto)
  profile: ProfileDto;

  @Field(() => [ModulePermissionDto])
  permissions: ModulePermissionDto[];
}