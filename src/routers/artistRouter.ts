import { Router } from "express";
import { getAlbumById } from "../controllers/artist/albumController";

const artistRouter = Router();

//customer APIs below
artistRouter.get("/");
artistRouter.get("/album/:id", getAlbumById);

artistRouter.get("/auth/login");

export default artistRouter;
