import "dotenv/config";
import prisma from "./config/db.js";

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      passwordHash: "dummy-password-hash",
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Test Project",
      apiKey: `test-api-key-${Date.now()}`,
      userId: user.id,
    },
  });

  console.log("Project created:");
  console.log(project);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });