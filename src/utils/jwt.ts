import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import prisma from "../prisma";
import { config } from "../config/app.config";
import { NextFunction, Request, Response } from "express-serve-static-core";
import userService from "../services/userService";

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

type Role = "user" | "validUser" | "artist" | "admin";

export const authorize = (allowedRole: Role) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const { payload, error } = verifyJwtToken<AccessPayload>(token);

    if (error || !payload) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (payload.role === allowedRole) {
      next();
    } else if (payload.role === "user" && allowedRole === "validUser") {
      const user = await userService.findUser(payload.userId);
      const now = new Date();

      if (user.valid_until < now) {
        return res
          .status(403)
          .json({ message: "Please extend your subscription." });
      }
      next();
      //check valid logic
    } else {
      return res.status(403).json({ message: "Unauthorize request" });
    }
  };
};

export const getTokenData = (
  req: Request,
  res: Response
): AccessPayload | any => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Bearer <token>

    try {
      const decodedPayload = verifyJwtToken(token);

      if (decodedPayload) {
        return decodedPayload.payload;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid token format or missing userId" });
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      return res.status(400).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};
