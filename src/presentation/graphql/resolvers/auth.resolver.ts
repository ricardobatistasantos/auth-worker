import { UseGuards } from '@nestjs/common';
import { PermissionUseCase } from '@application/use-cases/permission.use-case';
import { PermissionDto } from '@application/dtos/permission.response.dto';
import { JwtAuthGuard } from '@presentation/shared/guards/jwt-auth-guard';
import { LoginUseCase } from '@application/use-cases/login.use-case';
import { Resolver, Args, Query, Context } from '@nestjs/graphql';
import { AuthDto } from '@application/dtos/auth.response.dto';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly permissionUseCase: PermissionUseCase,
  ) {}

  @Query(() => AuthDto)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    if (!email || !password) throw new Error('Email and password are required');
    return this.loginUseCase.execute(email, password);
  }

  @Query(() => [PermissionDto])
  @UseGuards(JwtAuthGuard)
  async myPermissions(@Context() context: any) {
    const { userId, profileId } = context.req.user;
    if (!userId || !profileId)
      throw new Error('userId and profileId are required');
    return this.permissionUseCase.execute(userId, profileId);
  }
}
