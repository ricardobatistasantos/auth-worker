import { Injectable } from "@nestjs/common";
import { JwtService } from "@helpers/jwt.service";
import { BcryptService } from "@helpers/bcrypt.service";
import { UserRepository } from "@infra/repositories/user.repository";

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
  ) { }

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await this.bcryptService.compare(password, user.password)))
      throw new Error('Invalid credentials');
    
    const token = this.jwtService.generateToken({
      user: {
        userId: user.id,
        profileId: user.profile.id
      }
    });

    return {
      accessToken: token,
      user: {
        name: user.name,
        email: user.email,
        profile: {
          code: user.profile.code,
          name: user.profile.name,
        }
      }
    };
  }

}
