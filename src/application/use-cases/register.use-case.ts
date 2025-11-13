import { Injectable } from "@nestjs/common";
import { BcryptService } from "@helpers/bcrypt.service";
import { User } from "@domain/entities/user.entity";
import { UserRepository } from "@infra/repositories/user.repository";


@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService
  ) { }

  async execute(email: string, name: string, password: string, roleId: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await this.bcryptService.hash(password);
    const newUser = new User({ email, name, password: hashedPassword });

    const user = await this.userRepository.create(newUser);

    await this.userRepository.createRelationsUserRoles(user.id, roleId);

    const roles = this.userRepository.rolesByUser(user.id);

    return { ...user, roles }
  }
}