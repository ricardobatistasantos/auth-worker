import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfileDto {
  @Field()
  code: string;

  @Field()
  name: string;
}
