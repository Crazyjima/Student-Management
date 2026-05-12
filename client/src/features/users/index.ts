export { UsersListPage } from './pages/UsersListPage';
export { UserNewPage } from './pages/UserNewPage';
export { UserDetailPage } from './pages/UserDetailPage';

export {
  useUsersList,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useChangePassword,
  useAddRole,
  useRemoveRole,
  useCreateStudentProfile,
  useCreateTeacherProfile,
} from './hooks';

export { usersService } from './services';

export {
  listUsersQuerySchema,
  createUserFormSchema,
  editUserFormSchema,
  changePasswordFormSchema,
  studentProfileFormSchema,
  teacherProfileFormSchema,
  studentProfileSchema,
  teacherProfileSchema,
  detailedUserSchema,
  type ListUsersQuery,
  type CreateUserFormValues,
  type EditUserFormValues,
  type ChangePasswordFormValues,
  type StudentProfileFormValues,
  type TeacherProfileFormValues,
  type DetailedUser,
  type StudentProfile,
  type TeacherProfile,
} from './schemas';
