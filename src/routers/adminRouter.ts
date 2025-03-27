import { Router } from "express";
import { authenticateJWT } from "../strategies/jwt.strategy";
import { authorize } from "../utils/jwt";
import adminAuthController from "../controllers/auth/adminAuthController";
import createMulter from "../middleware/multer";
import { createGenre } from "../controllers/admin/genreController";
import { createPackage } from "../controllers/admin/packageController";

const adminRouter = Router();

//customer APIs below
adminRouter.get("/");
// adminRouter.get("/:id");

adminRouter.post("/auth/login", adminAuthController.login);
adminRouter.post(
  "/auth/register",
  createMulter("uploads/admin", "image").fields([
    { name: "image", maxCount: 1 },
  ]),
  authenticateJWT,
  authorize("admin"),
  adminAuthController.register
);

//genre
adminRouter.post(
  "/genres/create",
  authenticateJWT,
  authorize("admin"),
  createGenre
);

//Subscription Packages
adminRouter.post(
  "/packages/create",
  authenticateJWT,
  authorize("admin"),
  createPackage
);

export default adminRouter;
