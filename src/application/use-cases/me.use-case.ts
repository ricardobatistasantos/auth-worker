import { Injectable } from "@nestjs/common";
import { PermissionRepository } from "@infra/repositories/permission.repository";
import { UserRepository } from "@infra/repositories/user.repository";

@Injectable()
export class MeUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
  ) { }

  async execute(userId: string, profileId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const permissions =
      await this.permissionRepository.permissionsByProfile(userId, profileId);
    
      return {
      name: user.name,
      email: user.email,
      profile: {
        code: user.profile.code,
        name: user.profile.name,
      },
      permissions,
    };
  }
}