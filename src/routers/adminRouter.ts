import { Router } from "express";

const adminRouter = Router();

//customer APIs below
adminRouter.get("/");
// adminRouter.get("/:id");

adminRouter.get("/auth/login");

export default adminRouter;
