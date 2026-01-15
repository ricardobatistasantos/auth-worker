import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { JwtAuthGuard } from '@presentation/shared/guards/jwt-auth-guard';
import { LoginUseCase } from '@application/use-cases/login.use-case';
import { AuthDto } from '@application/dtos/auth.response.dto';
import { PermissionDto } from '@application/dtos/permission.response.dto';
import { PermissionUseCase } from '@application/use-cases/permission.use-case';

@Resolver()
export class AuthResolver {

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly permissionUseCase: PermissionUseCase,
  ) { }

  @Mutation(() => AuthDto)
  async login(
    @Args('email') email: string,
    @Args('password') password: string
  ) {
    if (!email || !password)
      throw new Error('Email and password are required');
    return this.loginUseCase.execute(email, password);
  }

  @Query(() => [PermissionDto])
  @UseGuards(JwtAuthGuard)
  async myPermissions(@Context() context: any) {
    const { userId, profileId } = context.req.user;
    return this.permissionUseCase.execute(userId, profileId);
  }

}
