import { Router } from "express";
import { getUser } from "../controllers/user/userController";
import { authenticateJWT } from "../strategies/jwt.strategy";
import { authorize } from "../utils/jwt";

import userAuthController from "../controllers/auth/userAuthController";
import createMulter from "../middleware/multer";
import {
  mostListenTracks,
  playTrack,
  recentTracks,
  trendingTracks,
} from "../controllers/user/trackController";

const userRouter = Router();

//user APIs below
userRouter.get("/", getUser);
// userRouter.get("/:id");

userRouter.post("/auth/login", userAuthController.login);
userRouter.post(
  "/auth/register",
  createMulter("uploads/user", "image").fields([
    { name: "image", maxCount: 1 },
  ]),
  userAuthController.register
);
//subscription api
userRouter.get("/subscription", authenticateJWT, authorize("user"), playTrack);
userRouter.post("/subscribe", authenticateJWT, authorize("user"), playTrack);

// track APIs below
userRouter.post("/play", authenticateJWT, authorize("validUser"), playTrack);
userRouter.get(
  "/tracks/trending",
  authenticateJWT,
  authorize("validUser"),
  trendingTracks
);
userRouter.get(
  "/tracks/most-played",
  authenticateJWT,
  authorize("validUser"),
  mostListenTracks
);
userRouter.get(
  "/tracks/recent",
  authenticateJWT,
  authorize("validUser"),
  recentTracks
);

export default userRouter;
