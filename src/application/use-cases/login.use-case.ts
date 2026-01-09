import { Injectable } from "@nestjs/common";
import { JwtService } from "@helpers/jwt.service";
import { BcryptService } from "@helpers/bcrypt.service";
import { UserRepository } from "@infra/repositories/user.repository";
import { PermissionRepository } from "@infra/repositories/permission.repository";

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
  ) { }

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await this.bcryptService.compare(password, user.password)))
      throw new Error('Invalid credentials');

    if (!user.profileId)
      throw new Error('User profile is not set');

    const permissions
      = await this.permissionRepository.permissionsByProfile(user.profileId)
      
    const token = this.jwtService.generateToken({ user: { ...user } });
    
    return { accessToken: token, user: { ...user, ...{ permissions } } }
  };
}
