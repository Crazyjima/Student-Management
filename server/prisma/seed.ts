import { PrismaClient, RoleName } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const main = async (): Promise<void> => {
  await prisma.$connect();

  for (const roleName of Object.values(RoleName)) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName.toLowerCase()} role`,
      },
    });
  }

  const adminEmail = 'admin@school.local';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin === null) {
    const adminRole = await prisma.role.findUniqueOrThrow({
      where: { name: RoleName.ADMIN },
    });
    const passwordHash = await bcrypt.hash('Admin1234!', 12);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        isActive: true,
        userRoles: {
          create: [{ roleId: adminRole.id }],
        },
      },
    });
  }

  console.log('Database seeded successfully.');
  console.log('Admin login: admin@school.local / Admin1234!');
};

main()
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
