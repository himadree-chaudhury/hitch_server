import { Server } from "http";
import app from "./app";
import { envSecrets } from "./app/configs/env";
import { prisma } from "./app/db/prisma";

let server: Server;

const startServer = async () => {
  try {
    await prisma.$connect();
    server = app.listen(envSecrets.PORT, () => {
      console.log(
        `Server is running on port ${envSecrets.PORT} in ${envSecrets.NODE_ENV} mode.`
      );
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

(async () => {
  await startServer();
})();

// *Graceful shutdown on process termination signals
process.on("SIGTERM", () => {
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// *Handle unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// *Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
