import prisma from "./config/db.js";

async function main() {
  // Create user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
    },
  });

  console.log("User created:", user);

  // Fetch users
  const users = await prisma.user.findMany();
  console.log("All users:", users);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });