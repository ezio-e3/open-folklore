// Seed script — re-runnable (upserts, not inserts), per the operational-risk
// mitigation in docs/phase5-analysis.md §6 ("seed data stored as a versioned
// script, never only as live rows that could be wiped").
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedStories } from "./seed-stories.js";

const prisma = new PrismaClient();

async function upsertUser(email: string, name: string, role: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, role, passwordHash },
  });
}

async function main() {
  console.log("Seeding test accounts...");

  // Test/demo credentials only — never used in production beyond the exam
  // demo (docs/phase4-effort-estimation.md §12 assumes a single test Moderator).
  const admin = await upsertUser("admin@openfolklore.org", "Admin User", "admin", "ChangeMe123!");
  const moderator = await upsertUser("moderator@openfolklore.org", "Kojo Aidoo", "moderator", "ChangeMe123!");
  const contributor = await upsertUser("contributor@openfolklore.org", "Ama Boateng", "contributor", "ChangeMe123!");

  console.log(`Seeded users: ${admin.email}, ${moderator.email}, ${contributor.email}`);

  await seedStories(prisma, contributor.id, moderator.id);

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
