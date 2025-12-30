import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { CreateUserDto } from '@application/dtos/create-user.request.dto';
import { RegisterUseCase } from '@application/use-cases/register.use-case';
import { JwtAuthGuard } from '@presentation/shared/guards/jwt-auth-guard';
import { LoginUseCase } from '@application/use-cases/login.use-case';
import { AuthDto } from '@application/dtos/auth.response.dto';
import { validateDto } from '@helpers/validate-dto';
import { User } from '@application/dtos/user-dto';
import { MeDto } from '@application/dtos/me.response.dto';
import { MeUseCase } from '@application/use-cases/me.use-case';

@Resolver(() => User)
export class AuthResolver {

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly meUseCase: MeUseCase,
  ) { }

  @Mutation(() => User)
  async register(@Args('input') input: CreateUserDto) {

    await validateDto(CreateUserDto, input);

    const { name, email, profileId, password, } = input;
    return this.registerUseCase.execute(name, email, profileId, password);
  }

  @Mutation(() => AuthDto)
  async login(
    @Args('email') email: string,
    @Args('password') password: string
  ) {
    if (!email || !password)
      throw new Error('Email and password are required');

    return this.loginUseCase.execute(email, password);
  }

  @Query(() => MeDto)
  @UseGuards(JwtAuthGuard)
  async me(@Context() context: any) {
    const { id: userId } = context.req.user;

    return this.meUseCase.execute(userId);
  }

}