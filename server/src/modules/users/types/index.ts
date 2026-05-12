import type {
  Role,
  RoleName,
  Student,
  Teacher,
  User,
  UserRole,
} from '@prisma/client';

export type UserWithRoles = User & {
  userRoles: (UserRole & { role: Role })[];
};

export type UserDetailRecord = UserWithRoles & {
  studentProfile: Student | null;
  teacherProfile: Teacher | null;
};

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  roles: RoleName[];
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DetailedUser extends PublicUser {
  studentProfile: Student | null;
  teacherProfile: Teacher | null;
}

export interface RequesterContext {
  id: string;
  roles: RoleName[];
}
