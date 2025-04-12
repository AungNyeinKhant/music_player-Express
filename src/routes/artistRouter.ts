import { Router } from "express";
import {
  albumList,
  createAlbum,
  getAlbumById,
  deleteAlbum,
  updateAlbum,
} from "../controllers/artist/albumController";
import artistAuthController from "../controllers/auth/artistAuthController";
import createMulter from "../middleware/multer";
import { authenticateJWT } from "../strategies/jwt.strategy";
import { authorize } from "../utils/jwt";
import {
  createTrack,
  getTracksByAlbumId,
  deleteTrack,
} from "../controllers/artist/trackController";
import { genreList } from "../controllers/artist/genreController";
import { getArtistProfile } from "../controllers/artist/profileController";
import { getPlayCountAnalytics } from "../controllers/artist/analyticController";

const artistRouter = Router();

//customer APIs below
// artistRouter.get("/");

artistRouter.post("/auth/login", artistAuthController.login);
artistRouter.post(
  "/auth/register",
  createMulter("uploads/artist", "image").fields([
    { name: "image", maxCount: 1 },
    { name: "bg_image", maxCount: 1 },
    { name: "nrc_front", maxCount: 1 },
    { name: "nrc_back", maxCount: 1 },
  ]), //.single("image"),
  artistAuthController.register
);
// album api below
artistRouter.post(
  "/album/create",
  authenticateJWT,
  authorize("artist"),
  createMulter("uploads/album", "image").fields([
    { name: "image", maxCount: 1 },
    { name: "bg_image", maxCount: 1 },
  ]),
  createAlbum
);
artistRouter.get(
  "/album/:id",
  authenticateJWT,
  authorize("artist"),
  getAlbumById
);

artistRouter.put(
  "/album/:id",
  authenticateJWT,
  authorize("artist"),
  createMulter("uploads/album", "image").fields([
    { name: "image", maxCount: 1 },
    { name: "bg_image", maxCount: 1 },
  ]),
  updateAlbum
);

artistRouter.delete(
  "/album/:id",
  authenticateJWT,
  authorize("artist"),
  deleteAlbum
);

artistRouter.get("/albums", authenticateJWT, authorize("artist"), albumList);
//track api below
artistRouter.post(
  "/track/create",
  authenticateJWT,
  authorize("artist"),
  createMulter("uploads/track", "audio").fields([
    { name: "audio", maxCount: 1 },
  ]),
  createTrack
);
artistRouter.get(
  "/tracks",
  authenticateJWT,
  authorize("artist"),
  getTracksByAlbumId
);
artistRouter.delete(
  "/track/:id",
  authenticateJWT, 
  authorize("artist"),
  deleteTrack
);
artistRouter.get(
  "/profile",
  authenticateJWT,
  authorize("artist"),
  getArtistProfile
);
artistRouter.put(
  "/profile",
  authenticateJWT,
  authorize("artist"),
  createMulter("uploads/artist", "image").fields([
    { name: "image", maxCount: 1 },
    { name: "bg_image", maxCount: 1 },
    
  ]),
  getArtistProfile
);
//genre api below
artistRouter.get("/genres", genreList);

// Analytics API below
artistRouter.get(
  "/analytics/plays",
  authenticateJWT,
  authorize("artist"),
  getPlayCountAnalytics
);

export default artistRouter;
