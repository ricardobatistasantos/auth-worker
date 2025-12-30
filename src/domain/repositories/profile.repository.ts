import { Profile } from "@domain/entities/profile.entity";

export abstract class IProfileRepository {
  abstract findById(id: string): Promise<Profile | null>;
}