import "dotenv/config";
import app from "./app";
import { prisma } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
  } catch (error) {
    console.error("Cannot connect to MySQL. Is XAMPP MySQL running on 3306?");
    console.error(error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
