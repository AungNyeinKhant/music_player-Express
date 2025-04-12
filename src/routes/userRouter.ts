import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user/profileController";
import { authenticateJWT } from "../strategies/jwt.strategy";
import { authorize } from "../utils/jwt";

import userAuthController from "../controllers/auth/userAuthController";
import createMulter, { deleteUploadedFile } from "../middleware/multer";
import {
  mostListenTracks,
  playTrack,
  recentTracks,
  trendingTracks,
  getTracksByArtist,
  getAllTracks,
  getTracksByAlbumId,
} from "../controllers/user/trackController";
import {
  albumList,
  mostPlayedAlbums,
  getAlbumById,
} from "../controllers/user/albumController";
import {
  getPackages,
  subscribePackage,
} from "../controllers/user/packageController";
import {
  createPlaylist,
  getPlaylists,
  handleTrack_Playlist,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/user/playlistController";
import {
  artistList,
  getArtistById,
} from "../controllers/user/artistController";

const userRouter = Router();

//refresh token api
userRouter.post("/auth/refresh-token", userAuthController.refreshToken);

//user APIs below
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

userRouter.get(
  "/tracks/artist/:artist_id",
  authenticateJWT,
  authorize("validUser"),
  getTracksByArtist
);
userRouter.get(
  "/tracks",
  authenticateJWT,
  authorize("validUser"),
  getAllTracks
);

//album Api below
userRouter.get("/albums", authenticateJWT, authorize("validUser"), albumList);
userRouter.get(
  "/albums/most-played",
  authenticateJWT,
  authorize("validUser"),
  mostPlayedAlbums
);

userRouter.get(
  "/albums/:id",
  authenticateJWT,
  authorize("validUser"),
  getAlbumById
);
userRouter.get(
  "/albums/:id/tracks",
  authenticateJWT,
  authorize("validUser"),
  getTracksByAlbumId
);

//artist Api below
userRouter.get("/artists", authenticateJWT, authorize("validUser"), artistList);
userRouter.get(
  "/artists/:id",
  authenticateJWT,
  authorize("validUser"),
  getArtistById
);

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
  "/playlists/handle-track",
  authenticateJWT,
  authorize("validUser"),
  handleTrack_Playlist
);

userRouter.put(
  "/playlists/:id",
  authenticateJWT,
  authorize("validUser"),
  updatePlaylist
);

userRouter.delete(
  "/playlists/:id",
  authenticateJWT,
  authorize("validUser"),
  deletePlaylist
);

userRouter.get("/profile", authenticateJWT, authorize("user"), getUserProfile);
userRouter.put(
  "/profile",
  authenticateJWT,
  authorize("user"),
  createMulter("uploads/user", "image").fields([
    { name: "image", maxCount: 1 },
  ]),
  updateUserProfile
);

export default userRouter;
