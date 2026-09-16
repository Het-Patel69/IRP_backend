import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AppError } from "../../errors/AppError";
import { prisma } from "../../lib/prisma";

import type {
  LoginInput,
  RegisterInput,
} from "./auth.types";

const SALT_ROUNDS = 12;

export async function registerUser(data: RegisterInput) {
  if (
    !data.email ||
    !data.password ||
    !data.firstName ||
    !data.lastName
  ) {
    throw new AppError(
      "All fields are required",
      400,
      "MISSING_FIELDS",
    );
  }

  const email = data.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists",
      409,
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const passwordHash = await bcrypt.hash(
    data.password,
    SALT_ROUNDS,
  );

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  const token = generateToken(user.id);

  return {
    user,
    token,
  };
}

export async function loginUser(data: LoginInput) {
  if (!data.email || !data.password) {
    throw new AppError(
      "Email and password are required",
      400,
      "MISSING_CREDENTIALS",
    );
  }

  const email = data.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user || user.deletedAt) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    },
    token,
  };
}

export async function getCurrentUser(userId: number) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND",
    );
  }

  return user;
}

function generateToken(userId: number) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError(
      "JWT secret is not configured",
      500,
      "JWT_SECRET_MISSING",
    );
  }

  return jwt.sign(
    {},
    secret,
    {
      subject: userId.toString(),
      expiresIn: "7d",
    },
  );
}