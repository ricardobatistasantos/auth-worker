export interface IPermissionRepository {
  getPermissions(userId: string, profileId: string): Promise<any>;
}
