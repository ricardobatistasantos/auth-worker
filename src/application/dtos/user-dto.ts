import { ObjectType, Field } from '@nestjs/graphql';
import { ProfileDto } from './profile.dto';

@ObjectType()
export class User {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  profile: ProfileDto;
}
