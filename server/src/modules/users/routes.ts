import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../auth/middleware.js';
import * as controller from './controller.js';
import {
  changePasswordBodySchema,
  createStudentProfileBodySchema,
  createTeacherProfileBodySchema,
  createUserBodySchema,
  listUsersQuerySchema,
  roleBodySchema,
  roleParamsSchema,
  updateUserBodySchema,
  userIdParamsSchema,
} from './dtos/users.dto.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/', validate({ query: listUsersQuerySchema }), controller.list);
usersRouter.post('/', validate({ body: createUserBodySchema }), controller.create);

usersRouter.get(
  '/:id',
  validate({ params: userIdParamsSchema }),
  controller.get,
);
usersRouter.patch(
  '/:id',
  validate({ params: userIdParamsSchema, body: updateUserBodySchema }),
  controller.update,
);
usersRouter.delete(
  '/:id',
  validate({ params: userIdParamsSchema }),
  controller.remove,
);

usersRouter.post(
  '/:id/change-password',
  validate({ params: userIdParamsSchema, body: changePasswordBodySchema }),
  controller.changePassword,
);

usersRouter.post(
  '/:id/roles',
  validate({ params: userIdParamsSchema, body: roleBodySchema }),
  controller.addRole,
);
usersRouter.delete(
  '/:id/roles/:roleName',
  validate({ params: roleParamsSchema }),
  controller.removeRole,
);

usersRouter.post(
  '/:id/student-profile',
  validate({ params: userIdParamsSchema, body: createStudentProfileBodySchema }),
  controller.createStudentProfile,
);
usersRouter.post(
  '/:id/teacher-profile',
  validate({ params: userIdParamsSchema, body: createTeacherProfileBodySchema }),
  controller.createTeacherProfile,
);
