import { Router } from "express";
import { createUser, getUser } from "../controllers/user/userController";

const userRouter = Router();

//user APIs below
userRouter.get("/", getUser);
// userRouter.get("/:id");

userRouter.post("/auth/login");
userRouter.post("/auth/register", createUser);

export default userRouter;
