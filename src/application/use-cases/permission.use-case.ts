import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository';
import { IPermissionRepository } from '@domain/repositories/permission.repository';

@Injectable()
export class PermissionUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(userId: string, profileId: string) {
    const user = await this.userRepository.findById(userId, profileId);
    if (!user) throw new Error('User not found');
    return await this.permissionRepository.getPermissions(userId, profileId);
  }
}
