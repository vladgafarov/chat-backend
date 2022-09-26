import { PrismaClient, User } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
const prisma = new PrismaClient();

const hashString = (data: string) => {
   const salt = genSaltSync(12);
   const hashedString = hashSync(data, salt);

   return hashedString;
};

const users: Pick<User, 'name' | 'email' | 'password'>[] = [
   {
      name: 'Alice',
      email: 'test@test.com',
      password: hashString('123456'),
   },
   {
      name: 'Bob',
      email: 'test2@test.com',
      password: hashString('123456'),
   },
   {
      name: 'John',
      email: 'test3@test.com',
      password: hashString('123456'),
   },
   {
      name: 'Max',
      email: 'test4@test.com',
      password: hashString('123456'),
   },
   {
      name: 'Bill',
      email: 'test5@test.com',
      password: hashString('123456'),
   },
];

async function main() {
   console.log(`Start seeding ...`);
   for (const u of users) {
      const user = await prisma.user.create({
         data: u,
      });
      console.log(`Created user with id: ${user.id}`);
   }

   console.log(`Seeding finished.`);
}

main()
   .then(async () => {
      await prisma.$disconnect();
   })
   .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
   });
