import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infra/database/pg-promise/config.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthResolver } from './graphql/resolvers/auth.resolver';
import { UserRepository } from '@infra/repositories/user.repository';
import { JwtService } from '@helpers/jwt.service';
import { BcryptService } from '@helpers/bcrypt.service';
import { LoginUseCase } from '@application/use-cases/login.use-case';
import { join } from 'path';
import { PermissionRepository } from '@infra/repositories/permission.repository';
import { PermissionUseCase } from '@application/use-cases/permission.use-case';

const resolvers = [AuthResolver,];
const userCases = [LoginUseCase, PermissionUseCase,];
const repositories = [UserRepository,PermissionRepository];
const services = [JwtService, BcryptService,];

@Module({
  imports: [
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(
        process.cwd(),
        'src/presentation/graphql/schemas/schemas.graphql'
      ),
      playground: true,
    }),
  ],
  providers: [
    ...resolvers,
    ...userCases,
    ...repositories,
    ...services,
  ]
})
export class AppModule { }