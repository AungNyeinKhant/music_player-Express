import { Router } from "express";
import {
  createCustomer,
  getCustomer,
} from "../controllers/customer/customerController";

const customerRouter = Router();

//customer APIs below
customerRouter.get("/", getCustomer);
// customerRouter.get("/:id");

customerRouter.post("/auth/login");
customerRouter.post("/auth/register", createCustomer);

export default customerRouter;
