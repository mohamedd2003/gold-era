import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import apiRoutes from "./routes/index";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware";

const app: Application = express();

// 1. Global middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Root + health check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is healthy and running",
  });
});

// 3. API routes (versioned)
app.use("/api/v1", apiRoutes);

// 4. 404 handler for unmatched routes
app.use(notFoundHandler);

// 5. Global error-handling middleware (must be last)
app.use(errorHandler);

export default app;
