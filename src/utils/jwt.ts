import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import prisma from "../prisma";
import { config } from "../config/app.config";
import { NextFunction, Request, Response } from "express-serve-static-core";

export type AccessPayload = {
  userId: string;
  role: "user" | "artist" | "admin";
};

export type RefreshPayload = {
  userId: string;
  role: "user" | "artist" | "admin";
  sessionId: number;
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
};

const defaults: SignOptions = {
  audience: ["user"],
};

export const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: parseInt(config.JWT.EXPIRES_IN),
  secret: config.JWT.SECRET,
};

export const refreshTokenSignOptions: SignOptsAndSecret = {
  expiresIn: parseInt(config.JWT.REFRESH_EXPIRES_IN),
  secret: config.JWT.REFRESH_SECRET,
};

export const signJwtToken = (
  payload: AccessPayload | RefreshPayload,
  options?: SignOptsAndSecret
) => {
  const { secret, ...opts } = options || accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });
};

export const verifyJwtToken = <TPayload extends object = AccessPayload>(
  token: string,
  options?: VerifyOptions & { secret: string }
) => {
  try {
    const { secret = config.JWT.SECRET, ...opts } = options || {};
    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...opts,
    }) as TPayload;
    return { payload };
  } catch (err: any) {
    return {
      error: err.message,
    };
  }
};

type Role = "user" | "artist" | "admin";

export const authorize = (allowedRole: Role) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const { payload, error } = verifyJwtToken<AccessPayload>(token);

    if (error || !payload) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    if (payload.role === allowedRole) {
      next();
    } else {
      res.status(403).json({ message: "Unauthorize request" });
      return;
    }
  };
};
