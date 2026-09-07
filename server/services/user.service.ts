import { BadRequestError, NotFoundError } from "../errors/HttpError";
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

  async update(
    id: number,
    dto: UpdateUserDto,
    actorId: number
  ): Promise<PublicUser> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError("User not found");
    }
    // Guards against an admin accidentally locking themselves out.
    if (id === actorId && dto.role && dto.role !== existing.role) {
      throw new BadRequestError("You cannot change your own role");
    }
    const updated = await this.repo.update(id, dto);
    return toPublicUser(updated);
  }

  async remove(id: number, actorId: number): Promise<void> {
    if (id === actorId) {
      throw new BadRequestError("You cannot delete your own account");
    }
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError("User not found");
    }
    // Related files and verification codes cascade via the schema.
    await this.repo.delete(id);
  }
}

export const userService = new UserService();
