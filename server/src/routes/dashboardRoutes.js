import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getDashboard));

export default router;