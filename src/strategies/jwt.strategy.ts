import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithRequest,
} from "passport-jwt";
import { UnauthorizedException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-code.enum";
import { config } from "../config/app.config";
import passport, { PassportStatic } from "passport";
import { AccessPayload } from "../utils/jwt";
import prisma from "../prisma";

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT.SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(options, async (req, payload: AccessPayload, done) => {
      try {
        if (payload.role == "user") {
          const user = await prisma.user.findFirst({
            where: { id: payload.userId },
          });
          if (!user) {
            return done(null, false);
          }

          return done(null, user);
        } else if (payload.role == "artist") {
          const artist = await prisma.artist.findFirst({
            where: { id: payload.userId },
          });
          if (!artist) {
            return done(null, false);
          }

          return done(null, artist);
        } else if (payload.role == "admin") {
          const admin = await prisma.admin.findFirst({
            where: { id: payload.userId },
          });
          if (!admin) {
            return done(null, false);
          }

          return done(null, admin);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

export const authenticateJWT = passport.authenticate("jwt", { session: false });
