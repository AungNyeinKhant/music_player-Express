import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

import { getEnv } from "./utils/helper";
import customerRouter from "./routers/customerRouter";
import artistRouter from "./routers/artistRouter";
import adminRouter from "./routers/adminRouter";

const app = express();
const PORT = getEnv("PORT", "3000");
const BASE_PATH = getEnv("BASE_PATH", "/api/v1");

dotenv.config();
app.use(helmet());
app.use(
  cors({
    origin: getEnv("APP_ORIGIN", "localhost"), //["http://localhost:3000", "https://yourdomain.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // credentials: true,
    maxAge: 86400, // 24 hours
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(`${BASE_PATH}/customer`, customerRouter);
app.use(`${BASE_PATH}/artist`, artistRouter);
app.use(`${BASE_PATH}/admin`, adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
