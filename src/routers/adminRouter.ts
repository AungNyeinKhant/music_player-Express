import { Router } from "express";
import { authenticateJWT } from "../strategies/jwt.strategy";
import { authorize } from "../utils/jwt";
import adminAuthController from "../controllers/auth/adminAuthController";
import createMulter from "../middleware/multer";
import { createGenre } from "../controllers/admin/genreController";
import {
  confirmPurchase,
  createPackage,
  purchaseList,
} from "../controllers/admin/packageController";
import {
  getPlayCountAnalytics,
  getPurchaseAnalytics,
} from "../controllers/admin/analyticsController";

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

export default adminRouter;
