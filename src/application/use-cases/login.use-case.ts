import { Inject, Injectable } from '@nestjs/common';
import { BcryptService } from '@helpers/bcrypt.service';
import { IUserRepository } from '@domain/repositories/user.repository';
import { ITokenService } from '@application/contracts/jwt.service.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITokenService')
    private readonly jwtService: ITokenService,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await this.bcryptService.compare(password, user.password)))
      throw new Error('Invalid credentials');

    const token = this.jwtService.generateToken({
      user: {
        userId: user.id,
        profileId: user.profile.id,
      },
    });

    return {
      accessToken: token,
      user: {
        name: user.name,
        email: user.email,
        profile: {
          code: user.profile.code,
          name: user.profile.name,
        },
      },
    };
  }
}
