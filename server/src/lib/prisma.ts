import { PrismaClient } from "@prisma/client";

// Single shared instance — avoids exhausting SQLite connections by creating a
// new client per request.
export const prisma = new PrismaClient();
