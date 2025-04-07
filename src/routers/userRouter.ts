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
import { albumList } from "../controllers/user/albumController";
import {
  getPackages,
  subscribePackage,
} from "../controllers/user/packageController";
import {
  createPlaylist,
  getPlaylists,
  addTrackToPlaylist,
} from "../controllers/user/playlistController";

const userRouter = Router();

//refresh token api
userRouter.post("/auth/refresh-token", userAuthController.refreshToken);

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
// userRouter.get("/subscription", authenticateJWT, authorize("user"), playTrack);
// userRouter.post("/subscribe", authenticateJWT, authorize("user"), playTrack);

// package APIs
userRouter.get("/packages", authenticateJWT, authorize("user"), getPackages);
userRouter.post(
  "/subscribe-package",
  authenticateJWT,
  authorize("user"),
  createMulter("uploads/transitions", "image").fields([
    { name: "transition", maxCount: 1 },
  ]),
  subscribePackage
);

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

//album Api below
userRouter.get("/albums", authenticateJWT, authorize("validUser"), albumList);

//playlist APIs
userRouter.post(
  "/playlists",
  authenticateJWT,
  authorize("validUser"),
  createPlaylist
);

userRouter.get(
  "/playlists",
  authenticateJWT,
  authorize("validUser"),
  getPlaylists
);

userRouter.post(
  "/playlists/add-track",
  authenticateJWT,
  authorize("validUser"),
  addTrackToPlaylist
);

export default userRouter;
