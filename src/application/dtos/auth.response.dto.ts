import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user-dto';

@ObjectType()
export class AuthDto {
  @Field()
  accessToken: string;

  @Field()
  user: User;
}
