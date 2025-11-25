import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { LoginUseCase } from '@application/use-cases/login.use-case';
import { RegisterUseCase } from '@application/use-cases/register.use-case';
import { User, ResponseAuth, CreateUserInput } from '@application/dtos/user-dto';
import { JwtAuthGuard } from '@presentation/shared/guards/jwt-auth-guard';

@Resolver(() => User)
export class AuthResolver {

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) { }

  @Mutation(() => User)
  async register(@Args('input') input: CreateUserInput) {
    const { name, email, password } = input;
    return this.registerUseCase.execute(email, name, password);
  }

  @Mutation(() => ResponseAuth)
  async login(@Args('email') email: string, @Args('password') password: string) {
    return this.loginUseCase.execute(email, password);
  }

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async me(@Context() context: any) {
    return context.req.user;
  }

}