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

  async execute(name: string, email: string, profileId: string, password: string) {
    const hashedPassword = await this.bcryptService.hash(password);
    const newUser = new User({ name, email, profile: { id: profileId }, password: hashedPassword });
    const user = await this.userRepository.create(newUser);
    return { ...user }
  }
}