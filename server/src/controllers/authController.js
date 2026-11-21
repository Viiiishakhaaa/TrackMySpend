import { z } from "zod";

import {
  registerUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
  logoutUser,
} from "../services/authService.js";

import ApiError from "../utils/ApiError.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must have at least 2 characters"),
  email: z.string()
    .trim()
    .email("Enter a valid email")
    .transform((value) => value.toLowerCase()),
  password: z.string()
    .min(8, "Password must have at least 8 characters")
    .max(72),
});

const loginSchema = z.object({
  email: z.string()
    .trim()
    .email("Enter a valid email")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

// REGISTER
const register = async (req, res) => {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    throw new ApiError(
      400,
      "Invalid registration details",
      validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }))
    );
  }

  const user = await registerUser(validation.data);

  res.status(201).json({
    success: true,
    message: "Account created successfully!",
    data: { user },
  });
};

// LOGIN
const login = async (req, res) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    throw new ApiError(
      400,
      "Invalid login details",
      validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }))
    );
  }

  const result = await loginUser(validation.data);

  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful!",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};

// REFRESH TOKEN
const refresh = async (req, res) => {
  const result = await refreshAccessToken(req.cookies?.refreshToken);

  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully!",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};

// CURRENT USER
const currentUser = async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    message: "User fetched successfully!",
    data: { user },
  });
};

// LOGOUT
const logout = async (req, res) => {
  await logoutUser(req.cookies?.refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully!",
  });
};

export {
  register,
  login,
  refresh,
  currentUser,
  logout,
};