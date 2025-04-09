import { Router } from "express";
import { authenticateJWT } from "../strategies/jwt.strategy";
import { authorize } from "../utils/jwt";
import adminAuthController from "../controllers/auth/adminAuthController";
import createMulter from "../middleware/multer";
import { createGenre, updateGenre, deleteGenre } from "../controllers/admin/genreController";
import {
  confirmPurchase,
  createPackage,
  purchaseList,
  updatePackage,
  deletePackage,
} from "../controllers/admin/packageController";
import {
  getPlayCountAnalytics,
  getPurchaseAnalytics,
  getTopAlbums,
  getTopArtists,
  getTopGenres,
  getMonthlyTotalAnalytics,
} from "../controllers/admin/analyticsController";

import { deleteArtist, getArtists } from "../controllers/admin/artistController";
import { deleteUser, getUsers } from "../controllers/admin/userController";


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

adminRouter.put(
  "/genres/:id",
  authenticateJWT,
  authorize("admin"),
  updateGenre
);

adminRouter.delete(
  "/genres/:id",
  authenticateJWT,
  authorize("admin"),
  deleteGenre
);

//Subscription Packages
adminRouter.post(
  "/packages/create",
  authenticateJWT,
  authorize("admin"),
  createPackage
);

adminRouter.put(
  "/packages/:id",
  authenticateJWT,
  authorize("admin"),
  updatePackage
);

adminRouter.delete(
  "/packages/:id",
  authenticateJWT,
  authorize("admin"),
  deletePackage
);

//accept purchase
adminRouter.get("/purchase", authenticateJWT, authorize("admin"), purchaseList);
adminRouter.post(
  "/purchase/handle",
  authenticateJWT,
  authorize("admin"),
  confirmPurchase
);

// Analytics Routes
adminRouter.get(
  "/analytics/plays",
  authenticateJWT,
  authorize("admin"),
  getPlayCountAnalytics
);

adminRouter.get(
  "/analytics/purchases",
  authenticateJWT,
  authorize("admin"),
  getPurchaseAnalytics
);

adminRouter.get(
  "/analytics/artists",
  authenticateJWT,
  authorize("admin"),
  getTopArtists
);

adminRouter.get(
  "/analytics/genres",
  authenticateJWT,
  authorize("admin"),
  getTopGenres
);

adminRouter.get(
  "/analytics/albums",
  authenticateJWT,
  authorize("admin"),
  getTopAlbums
);

adminRouter.get(
  "/analytics/monthly-total",
  authenticateJWT,
  authorize("admin"),
  getMonthlyTotalAnalytics
);

// Artist Routes
adminRouter.get(
  "/artists",
  authenticateJWT,
  authorize("admin"),
  getArtists
);
adminRouter.delete(
  "/artists/:id",
  authenticateJWT,
  authorize("admin"),
  deleteArtist
  
);

adminRouter.get(
  "/users",
  authenticateJWT,
  authorize("admin"),
  getUsers
);
// Profile Routes

adminRouter.delete(
  "/users/:id",
  authenticateJWT,
  authorize("admin"),
  deleteUser
);

export default adminRouter;
