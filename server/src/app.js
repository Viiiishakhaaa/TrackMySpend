import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import prisma from "./config/prisma.js";
import authRoutes from "./routes/authRoutes.js";

import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";


const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Request parsing middleware
app.use(express.json());
app.use(cookieParser());

// Logging middleware
app.use(morgan("dev"));

// HEALTH CHECK: Express server
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TrackMySpend API is running!",
  });
});

// HEALTH CHECK: Database connection
app.get("/api/health/db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Database connection successful!",
      database: result,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions",transactionRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/categories",categoryRoutes);

// Handle unknown routes
app.use(notFoundMiddleware);

// Centralized error handling
app.use(errorMiddleware);

export default app;