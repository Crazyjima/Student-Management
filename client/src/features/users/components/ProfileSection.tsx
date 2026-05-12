import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { errorMessage } from '@/lib/api-error';
import { toast } from '@/store/toast-store';
import {
  studentProfileFormSchema,
  teacherProfileFormSchema,
  type DetailedUser,
  type StudentProfileFormValues,
  type TeacherProfileFormValues,
} from '../schemas';
import { useCreateStudentProfile, useCreateTeacherProfile } from '../hooks';
import './ProfileSection.css';

interface ProfileSectionProps {
  user: DetailedUser;
}

const formatDate = (value: Date | null): string => {
  if (value === null) return '-';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(value);
};

export const ProfileSection = ({ user }: ProfileSectionProps): ReactElement => {
  const createStudentProfile = useCreateStudentProfile();
  const createTeacherProfile = useCreateTeacherProfile();

  const studentForm = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileFormSchema),
    defaultValues: {
      studentNumber: '',
      dateOfBirth: '',
      gender: undefined,
      enrollmentDate: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      address: '',
    },
  });

  const teacherForm = useForm<TeacherProfileFormValues>({
    resolver: zodResolver(teacherProfileFormSchema),
    defaultValues: {
      employeeNumber: '',
      hireDate: '',
      department: '',
      qualification: '',
    },
  });

  const canCreateStudent = user.studentProfile === null && user.roles.includes('STUDENT');
  const canCreateTeacher = user.teacherProfile === null && user.roles.includes('TEACHER');

  const handleStudentSubmit = studentForm.handleSubmit((values) => {
    createStudentProfile.mutate(
      {
        id: user.id,
        input: {
          studentNumber: values.studentNumber,
          ...(values.dateOfBirth ? { dateOfBirth: values.dateOfBirth } : {}),
          ...(values.gender ? { gender: values.gender } : {}),
          ...(values.enrollmentDate ? { enrollmentDate: values.enrollmentDate } : {}),
          ...(values.guardianName ? { guardianName: values.guardianName } : {}),
          ...(values.guardianPhone ? { guardianPhone: values.guardianPhone } : {}),
          ...(values.guardianEmail ? { guardianEmail: values.guardianEmail } : {}),
          ...(values.address ? { address: values.address } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success('Student profile created');
          studentForm.reset();
        },
        onError: (err) => {
          toast.error(errorMessage(err));
        },
      },
    );
  });

  const handleTeacherSubmit = teacherForm.handleSubmit((values) => {
    createTeacherProfile.mutate(
      {
        id: user.id,
        input: {
          employeeNumber: values.employeeNumber,
          ...(values.hireDate ? { hireDate: values.hireDate } : {}),
          ...(values.department ? { department: values.department } : {}),
          ...(values.qualification ? { qualification: values.qualification } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success('Teacher profile created');
          teacherForm.reset();
        },
        onError: (err) => {
          toast.error(errorMessage(err));
        },
      },
    );
  });

  return (
    <section className="profile-section">
      <div className="profile-section__card">
        <div className="profile-section__card-header">
          <h2>Student profile</h2>
          <p>Enrollment details, guardians, and learner record.</p>
        </div>
        {user.studentProfile !== null ? (
          <dl className="profile-section__details">
            <div><dt>Student number</dt><dd>{user.studentProfile.studentNumber}</dd></div>
            <div><dt>Gender</dt><dd>{user.studentProfile.gender ?? '-'}</dd></div>
            <div><dt>Date of birth</dt><dd>{formatDate(user.studentProfile.dateOfBirth)}</dd></div>
            <div><dt>Enrollment date</dt><dd>{formatDate(user.studentProfile.enrollmentDate)}</dd></div>
            <div><dt>Guardian</dt><dd>{user.studentProfile.guardianName ?? '-'}</dd></div>
            <div><dt>Guardian phone</dt><dd>{user.studentProfile.guardianPhone ?? '-'}</dd></div>
            <div><dt>Guardian email</dt><dd>{user.studentProfile.guardianEmail ?? '-'}</dd></div>
            <div><dt>Address</dt><dd>{user.studentProfile.address ?? '-'}</dd></div>
          </dl>
        ) : canCreateStudent ? (
          <form className="profile-section__form" onSubmit={handleStudentSubmit} noValidate>
            <FormField label="Student number" htmlFor="student-number" required error={studentForm.formState.errors.studentNumber?.message}>
              <Input id="student-number" {...studentForm.register('studentNumber')} />
            </FormField>
            <div className="profile-section__form-grid">
              <FormField label="Date of birth" htmlFor="date-of-birth" error={studentForm.formState.errors.dateOfBirth?.message}>
                <Input id="date-of-birth" type="date" {...studentForm.register('dateOfBirth')} />
              </FormField>
              <FormField label="Enrollment date" htmlFor="enrollment-date" error={studentForm.formState.errors.enrollmentDate?.message}>
                <Input id="enrollment-date" type="date" {...studentForm.register('enrollmentDate')} />
              </FormField>
            </div>
            <div className="profile-section__form-grid">
              <FormField label="Gender" htmlFor="gender" error={studentForm.formState.errors.gender?.message}>
                <Select id="gender" {...studentForm.register('gender')}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </Select>
              </FormField>
              <FormField label="Guardian name" htmlFor="guardian-name" error={studentForm.formState.errors.guardianName?.message}>
                <Input id="guardian-name" {...studentForm.register('guardianName')} />
              </FormField>
            </div>
            <div className="profile-section__form-grid">
              <FormField label="Guardian phone" htmlFor="guardian-phone" error={studentForm.formState.errors.guardianPhone?.message}>
                <Input id="guardian-phone" {...studentForm.register('guardianPhone')} />
              </FormField>
              <FormField label="Guardian email" htmlFor="guardian-email" error={studentForm.formState.errors.guardianEmail?.message}>
                <Input id="guardian-email" type="email" {...studentForm.register('guardianEmail')} />
              </FormField>
            </div>
            <FormField label="Address" htmlFor="address" error={studentForm.formState.errors.address?.message}>
              <Input id="address" {...studentForm.register('address')} />
            </FormField>
            <div className="profile-section__actions">
              <Button type="submit" isLoading={createStudentProfile.isPending}>
                Save student profile
              </Button>
            </div>
          </form>
        ) : (
          <p className="profile-section__empty">Assign the STUDENT role to unlock student profile setup.</p>
        )}
      </div>

      <div className="profile-section__card">
        <div className="profile-section__card-header">
          <h2>Teacher profile</h2>
          <p>Staffing details, department, and teaching identity.</p>
        </div>
        {user.teacherProfile !== null ? (
          <dl className="profile-section__details">
            <div><dt>Employee number</dt><dd>{user.teacherProfile.employeeNumber}</dd></div>
            <div><dt>Hire date</dt><dd>{formatDate(user.teacherProfile.hireDate)}</dd></div>
            <div><dt>Department</dt><dd>{user.teacherProfile.department ?? '-'}</dd></div>
            <div><dt>Qualification</dt><dd>{user.teacherProfile.qualification ?? '-'}</dd></div>
          </dl>
        ) : canCreateTeacher ? (
          <form className="profile-section__form" onSubmit={handleTeacherSubmit} noValidate>
            <FormField label="Employee number" htmlFor="employee-number" required error={teacherForm.formState.errors.employeeNumber?.message}>
              <Input id="employee-number" {...teacherForm.register('employeeNumber')} />
            </FormField>
            <div className="profile-section__form-grid">
              <FormField label="Hire date" htmlFor="hire-date" error={teacherForm.formState.errors.hireDate?.message}>
                <Input id="hire-date" type="date" {...teacherForm.register('hireDate')} />
              </FormField>
              <FormField label="Department" htmlFor="department" error={teacherForm.formState.errors.department?.message}>
                <Input id="department" {...teacherForm.register('department')} />
              </FormField>
            </div>
            <FormField label="Qualification" htmlFor="qualification" error={teacherForm.formState.errors.qualification?.message}>
              <Input id="qualification" {...teacherForm.register('qualification')} />
            </FormField>
            <div className="profile-section__actions">
              <Button type="submit" isLoading={createTeacherProfile.isPending}>
                Save teacher profile
              </Button>
            </div>
          </form>
        ) : (
          <p className="profile-section__empty">Assign the TEACHER role to unlock teacher profile setup.</p>
        )}
      </div>
    </section>
  );
};
