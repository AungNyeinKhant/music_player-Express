import { Router } from "express";
import { getAlbumById } from "../controllers/artist/albumController";
import artistAuthController from "../controllers/auth/artistAuthController";
import createMulter from "../middleware/multer";

const artistRouter = Router();

//customer APIs below
artistRouter.get("/");
artistRouter.get("/album/:id", getAlbumById);

artistRouter.get("/auth/login");
artistRouter.get(
  "/auth/register",
  createMulter("uploads/artist", "image").fields([
    { name: "image", maxCount: 1 },
    { name: "bg_image", maxCount: 1 },
    { name: "nrc_front", maxCount: 1 },
    { name: "nrc_back", maxCount: 1 },
  ]), //.single("image"),
  artistAuthController.register
);

export default artistRouter;
