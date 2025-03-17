import { Router } from "express";
import { NextFunction, Request, Response } from "express-serve-static-core";
import { authenticateJWT } from "../strategies/jwt.strategy";
import { authorize } from "../utils/jwt";

const adminRouter = Router();

//customer APIs below
adminRouter.get("/");
// adminRouter.get("/:id");

adminRouter.post(
  "/auth/login",
  authenticateJWT,
  authorize("admin"),
  (req: Request, res: Response, next: NextFunction): any => {
    return res
      .status(200)
      .json({ message: "Welcome form admin protected route" });
  }
);

export default adminRouter;
