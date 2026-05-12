import {
  Prisma,
  RoleName,
  type Student,
  type Teacher,
} from '@prisma/client';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../shared/errors/app-error.js';
import { logger } from '../../shared/utils/logger.js';
import { hashPassword, verifyPassword } from '../../shared/utils/password.js';
import {
  buildPaginatedResult,
  paginationToSkipTake,
  type PaginatedResult,
} from '../../shared/utils/pagination.js';
import { authRepository } from '../auth/repository.js';
import { usersRepository, type UserListFilters, type UserListOrderBy } from './repository.js';
import type {
  ChangePasswordBody,
  CreateStudentProfileBody,
  CreateTeacherProfileBody,
  CreateUserBody,
  ListUsersQuery,
  UpdateUserBody,
} from './dtos/users.dto.js';
import type {
  DetailedUser,
  PublicUser,
  RequesterContext,
  UserDetailRecord,
  UserWithRoles,
} from './types/index.js';

const toPublicUser = (u: UserWithRoles): PublicUser => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  phone: u.phone,
  isActive: u.isActive,
  roles: u.userRoles.map((ur) => ur.role.name),
  emailVerifiedAt: u.emailVerifiedAt,
  lastLoginAt: u.lastLoginAt,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

const toDetailedUser = (u: UserDetailRecord): DetailedUser => ({
  ...toPublicUser(u),
  studentProfile: u.studentProfile,
  teacherProfile: u.teacherProfile,
});

const isAdmin = (r: RequesterContext): boolean => r.roles.includes(RoleName.ADMIN);

const requireAdmin = (r: RequesterContext): void => {
  if (!isAdmin(r)) {
    throw new ForbiddenError('Admin role required');
  }
};

const requireAdminOrSelf = (r: RequesterContext, targetId: string): void => {
  if (!isAdmin(r) && r.id !== targetId) {
    throw new ForbiddenError();
  }
};

export const usersService = {
  list: async (
    query: ListUsersQuery,
    requester: RequesterContext,
  ): Promise<PaginatedResult<PublicUser>> => {
    requireAdmin(requester);

    const { page, pageSize, sortBy, sortOrder, search, role, isActive } = query;
    const { skip, take } = paginationToSkipTake({ page, pageSize });
    const orderBy: UserListOrderBy = { field: sortBy, direction: sortOrder };

    const filters: UserListFilters = {
      ...(search !== undefined && { search }),
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
    };

    const { items, totalCount } = await usersRepository.list(filters, orderBy, skip, take);
    return buildPaginatedResult(items.map(toPublicUser), totalCount, { page, pageSize });
  },

  get: async (id: string, requester: RequesterContext): Promise<DetailedUser> => {
    requireAdminOrSelf(requester, id);
    const user = await usersRepository.findById(id);
    if (user === null) {
      throw new NotFoundError('User');
    }
    return toDetailedUser(user);
  },

  create: async (
    input: CreateUserBody,
    requester: RequesterContext,
  ): Promise<PublicUser> => {
    requireAdmin(requester);

    const existing = await usersRepository.findByEmail(input.email);
    if (existing !== null) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const data: Prisma.UserCreateInput = {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? null,
      isActive: input.isActive ?? true,
    };

    const user = await usersRepository.create(data, input.roles);
    logger.info(
      { userId: user.id, requesterId: requester.id, roles: input.roles },
      'user created',
    );
    return toPublicUser(user);
  },

  update: async (
    id: string,
    input: UpdateUserBody,
    requester: RequesterContext,
  ): Promise<PublicUser> => {
    const admin = isAdmin(requester);
    const isSelf = requester.id === id;
    if (!admin && !isSelf) {
      throw new ForbiddenError();
    }

    if (!admin && (input.email !== undefined || input.isActive !== undefined)) {
      throw new ForbiddenError('Only admins can change email or active status');
    }

    const data: Prisma.UserUpdateInput = {};
    if (input.firstName !== undefined) {
      data.firstName = input.firstName;
    }
    if (input.lastName !== undefined) {
      data.lastName = input.lastName;
    }
    if (input.phone !== undefined) {
      data.phone = input.phone;
    }
    if (admin && input.email !== undefined) {
      const conflict = await usersRepository.findByEmail(input.email);
      if (conflict !== null && conflict.id !== id) {
        throw new ConflictError('Email already in use');
      }
      data.email = input.email;
    }
    if (admin && input.isActive !== undefined) {
      data.isActive = input.isActive;
    }

    const updated = await usersRepository.update(id, data);
    if (updated === null) {
      throw new NotFoundError('User');
    }

    logger.info({ userId: id, requesterId: requester.id }, 'user updated');
    return toPublicUser(updated);
  },

  delete: async (id: string, requester: RequesterContext): Promise<void> => {
    requireAdmin(requester);
    if (id === requester.id) {
      throw new ConflictError('Cannot delete yourself');
    }
    const ok = await usersRepository.softDelete(id);
    if (!ok) {
      throw new NotFoundError('User');
    }
    await authRepository.revokeAllUserRefreshTokens(id);
    logger.info({ userId: id, requesterId: requester.id }, 'user soft-deleted');
  },

  changePassword: async (
    id: string,
    input: ChangePasswordBody,
    requester: RequesterContext,
  ): Promise<void> => {
    const admin = isAdmin(requester);
    const isSelf = requester.id === id;
    if (!admin && !isSelf) {
      throw new ForbiddenError();
    }

    const user = await usersRepository.findById(id);
    if (user === null) {
      throw new NotFoundError('User');
    }

    if (isSelf && !admin) {
      if (input.currentPassword === undefined) {
        throw new ValidationError('currentPassword required for self-service password change');
      }
      const valid = await verifyPassword(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedError('Current password incorrect');
      }
    }

    const newHash = await hashPassword(input.newPassword);
    const updated = await usersRepository.update(id, { passwordHash: newHash });
    if (updated === null) {
      throw new NotFoundError('User');
    }

    await authRepository.revokeAllUserRefreshTokens(id);
    logger.info({ userId: id, requesterId: requester.id }, 'password changed');
  },

  addRole: async (
    id: string,
    role: RoleName,
    requester: RequesterContext,
  ): Promise<PublicUser> => {
    requireAdmin(requester);
    const user = await usersRepository.findById(id);
    if (user === null) {
      throw new NotFoundError('User');
    }
    await usersRepository.addRole(id, role);
    const updated = await usersRepository.findById(id);
    if (updated === null) {
      throw new NotFoundError('User');
    }
    logger.info({ userId: id, role, requesterId: requester.id }, 'role added');
    return toPublicUser(updated);
  },

  removeRole: async (
    id: string,
    role: RoleName,
    requester: RequesterContext,
  ): Promise<PublicUser> => {
    requireAdmin(requester);
    if (id === requester.id && role === RoleName.ADMIN) {
      throw new ConflictError('Cannot remove your own ADMIN role');
    }
    const user = await usersRepository.findById(id);
    if (user === null) {
      throw new NotFoundError('User');
    }
    await usersRepository.removeRole(id, role);
    const updated = await usersRepository.findById(id);
    if (updated === null) {
      throw new NotFoundError('User');
    }
    logger.info({ userId: id, role, requesterId: requester.id }, 'role removed');
    return toPublicUser(updated);
  },

  createStudentProfile: async (
    userId: string,
    input: CreateStudentProfileBody,
    requester: RequesterContext,
  ): Promise<Student> => {
    requireAdmin(requester);

    const user = await usersRepository.findById(userId);
    if (user === null) {
      throw new NotFoundError('User');
    }
    const existing = await usersRepository.findStudentProfileByUserId(userId);
    if (existing !== null) {
      throw new ConflictError('Student profile already exists');
    }

    const data: Omit<Prisma.StudentUncheckedCreateInput, 'userId'> = {
      studentNumber: input.studentNumber,
      dateOfBirth: input.dateOfBirth ?? null,
      gender: input.gender ?? null,
      guardianName: input.guardianName ?? null,
      guardianPhone: input.guardianPhone ?? null,
      guardianEmail: input.guardianEmail ?? null,
      address: input.address ?? null,
      ...(input.enrollmentDate !== undefined && { enrollmentDate: input.enrollmentDate }),
    };

    const profile = await usersRepository.createStudentProfile(userId, data);
    logger.info(
      { userId, profileId: profile.id, requesterId: requester.id },
      'student profile created',
    );
    return profile;
  },

  createTeacherProfile: async (
    userId: string,
    input: CreateTeacherProfileBody,
    requester: RequesterContext,
  ): Promise<Teacher> => {
    requireAdmin(requester);

    const user = await usersRepository.findById(userId);
    if (user === null) {
      throw new NotFoundError('User');
    }
    const existing = await usersRepository.findTeacherProfileByUserId(userId);
    if (existing !== null) {
      throw new ConflictError('Teacher profile already exists');
    }

    const data: Omit<Prisma.TeacherUncheckedCreateInput, 'userId'> = {
      employeeNumber: input.employeeNumber,
      department: input.department ?? null,
      qualification: input.qualification ?? null,
      ...(input.hireDate !== undefined && { hireDate: input.hireDate }),
    };

    const profile = await usersRepository.createTeacherProfile(userId, data);
    logger.info(
      { userId, profileId: profile.id, requesterId: requester.id },
      'teacher profile created',
    );
    return profile;
  },
};
