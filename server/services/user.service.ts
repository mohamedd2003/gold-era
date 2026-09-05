import { NotFoundError } from "../errors/HttpError";
import { buildMeta, type PaginationParams } from "../utils/pagination";
import type { Meta } from "../utils/ApiResponse";
import type { Prisma } from "../generated/prisma/client";
import { toPublicUser, type PublicUser } from "../models/user.model";
import { UserRepository, userRepository } from "../repositories/user.repository";
import type { ListUsersQuery, UpdateUserDto } from "../validations/user.validation";

export class UserService {
  constructor(private readonly repo: UserRepository = userRepository) {}

  async list(
    query: ListUsersQuery,
    pagination: PaginationParams
  ): Promise<{ items: PublicUser[]; meta: Meta }> {
    const where: Prisma.UserWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }
    if (query.role) where.role = query.role;
    if (typeof query.isVerified === "boolean") {
      where.isVerified = query.isVerified;
    }

    const { items, total } = await this.repo.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [query.sortBy]: query.order },
    });

    return { items: items.map(toPublicUser), meta: buildMeta(total, pagination) };
  }

  async update(id: number, dto: UpdateUserDto): Promise<PublicUser> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError("User not found");
    }
    const updated = await this.repo.update(id, dto);
    return toPublicUser(updated);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError("User not found");
    }
    // Related files and verification codes cascade via the schema.
    await this.repo.delete(id);
  }
}

export const userService = new UserService();
