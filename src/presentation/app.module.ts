import { Module } from '@nestjs/common';
import { PermissionRepository } from '@infra/repositories/permission.repository';
import { PermissionUseCase } from '@application/use-cases/permission.use-case';
import { DatabaseModule } from '@infra/database/pg-promise/config.module';
import { UserRepository } from '@infra/repositories/user.repository';
import { LoginUseCase } from '@application/use-cases/login.use-case';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthResolver } from './graphql/resolvers/auth.resolver';
import { BcryptService } from '@helpers/bcrypt.service';
import { JwtService } from '@infra/token-service/jwt.service';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

const resolvers = [AuthResolver];
const userCases = [LoginUseCase, PermissionUseCase];
const repositories = [
  {
    provide: 'IUserRepository',
    useClass: UserRepository,
  },
  {
    provide: 'IPermissionRepository',
    useClass: PermissionRepository,
  },
];
const services = [
  {
    provide: 'ITokenService',
    useClass: JwtService,
  },
  BcryptService,
];

@Module({
  imports: [
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(
        process.cwd(),
        'src/presentation/graphql/schemas/schemas.graphql',
      ),
      playground: true,
    }),
  ],
  providers: [...resolvers, ...userCases, ...repositories, ...services],
})
export class AppModule {}
