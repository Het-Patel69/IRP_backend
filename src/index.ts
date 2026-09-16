import "dotenv/config";

import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

startServer();