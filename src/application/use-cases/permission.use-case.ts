import { Injectable } from "@nestjs/common";
import { PermissionRepository } from "@infra/repositories/permission.repository";
import { UserRepository } from "@infra/repositories/user.repository";

@Injectable()
export class PermissionUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
  ) { }

  async execute(userId: string, profileId: string) {
    const user = await this.userRepository.findById(userId, profileId);
    if (!user) throw new Error('User not found');
    return await this.permissionRepository.getPermissions(userId, profileId);
  }
}