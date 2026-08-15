const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('YourAdminPassword123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@upsplatform.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin created:', admin);
  process.exit(0);
}

createAdmin();