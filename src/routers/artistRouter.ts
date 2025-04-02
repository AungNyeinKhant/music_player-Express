import { Router } from "express";
import {
  albumList,
  createAlbum,
  getAlbumById,
} from "../controllers/artist/albumController";
import artistAuthController from "../controllers/auth/artistAuthController";
import createMulter from "../middleware/multer";
import { authenticateJWT } from "../strategies/jwt.strategy";
import { authorize } from "../utils/jwt";
import { createTrack } from "../controllers/artist/trackController";
import { genreList } from "../controllers/artist/genreController";

const artistRouter = Router();

//customer APIs below
// artistRouter.get("/");
artistRouter.get(
  "/album/:id",
  authenticateJWT,
  authorize("artist"),
  getAlbumById
);

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

//genre api below
artistRouter.get("/genres", authenticateJWT, authorize("artist"), genreList);

export default artistRouter;
