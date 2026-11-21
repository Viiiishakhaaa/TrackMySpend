import express from "express";

import {
  register,
  login,
  refresh,
  currentUser,
  logout,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.get("/me", authMiddleware, asyncHandler(currentUser));
router.post("/logout", asyncHandler(logout));

export default router;