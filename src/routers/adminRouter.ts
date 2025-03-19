import { Router } from "express";
import { NextFunction, Request, Response } from "express-serve-static-core";
import { authenticateJWT } from "../strategies/jwt.strategy";
import { authorize } from "../utils/jwt";
import adminAuthController from "../controllers/auth/adminAuthController";
import createMulter from "../middleware/multer";

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
  adminAuthController.register
);

export default adminRouter;
