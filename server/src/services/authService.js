import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

// HELPERS

const generateAccessToken = (userId) => {
  return jwt.sign(
    {},
    process.env.ACCESS_TOKEN_SECRET,
    {
      subject: userId,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    }
  );
};

const getRefreshExpiry = () => {
  const expiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";
  const match = expiry.match(/^(\d+)([dhm])$/);

  if (!match) {
    throw new Error("Invalid REFRESH_TOKEN_EXPIRY format");
  }

  const amount = Number(match[1]);

  const milliseconds = {
    d: 86400000,
    h: 3600000,
    m: 60000,
  }[match[2]];

  return new Date(Date.now() + amount * milliseconds);
};

const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// REGISTER

const registerUser = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      initialBalance: 0,
      currency: "INR",
    },
    select: {
      id: true,
      name: true,
      email: true,
      initialBalance: true,
      currency: true,
      createdAt: true,
    },
  });
};

// LOGIN

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const validPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!validPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = crypto.randomBytes(64).toString("hex");

  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: getRefreshExpiry(),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      initialBalance: user.initialBalance,
      currency: user.currency,
    },
  };
};

// REFRESH TOKEN

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is missing");
  }

  const tokenHash = hashRefreshToken(refreshToken);

  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash },
  });

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= new Date()
  ) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const newRefreshToken = crypto.randomBytes(64).toString("hex");
  const newTokenHash = hashRefreshToken(newRefreshToken);

  const user = await prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshSession.updateMany({
      where: {
        id: session.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { revokedAt: new Date() },
    });

    if (revoked.count !== 1) {
      throw new ApiError(401, "Refresh token has already been used");
    }

    await tx.refreshSession.create({
      data: {
        userId: session.userId,
        tokenHash: newTokenHash,
        expiresAt: getRefreshExpiry(),
      },
    });

    return tx.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        initialBalance: true,
        currency: true,
      },
    });
  });

  if (!user) {
    throw new ApiError(401, "User account not found");
  }

  return {
    accessToken: generateAccessToken(user.id),
    refreshToken: newRefreshToken,
    user,
  };
};

// LOGOUT

const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.refreshSession.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

// GET CURRENT USER

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      initialBalance: true,
      currency: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
};