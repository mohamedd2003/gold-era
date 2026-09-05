import { BaseRepository } from "./base.repository";
import type { Prisma, User } from "../generated/prisma/client";

export interface FindUsersOptions {
  where: Prisma.UserWhereInput;
  skip: number;
  take: number;
  orderBy: Prisma.UserOrderByWithRelationInput;
}

/**
 * Data-access layer for user administration.
 */
export class UserRepository extends BaseRepository {
  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findMany(
    options: FindUsersOptions
  ): Promise<{ items: User[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where: options.where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
      }),
      this.prisma.user.count({ where: options.where }),
    ]);
    return { items, total };
  }

  update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  delete(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}

export const userRepository = new UserRepository();
