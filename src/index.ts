import express from "express";
import helmet from "helmet";
import cors from "cors";
import "dotenv/config";

import userRouter from "./routers/userRouter";
import artistRouter from "./routers/artistRouter";
import adminRouter from "./routers/adminRouter";
import { config } from "./config/app.config";
import { errorHandler } from "./middleware/errorHandler";
import passport from "./middleware/passport";
import path from "path";

const app = express();
const PORT = config.PORT;
const BASE_PATH = config.BASE_PATH;

app.use(helmet());
app.use(
  cors({
    origin: config.ALLOW_ORIGIN, //["http://localhost:3000", "https://yourdomain.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], //, "Range", "Accept"
    // exposedHeaders: ["Content-Range", "Content-Length", "Accept-Ranges"],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use(`${BASE_PATH}/user`, userRouter);
app.use(`${BASE_PATH}/artist`, artistRouter);
app.use(`${BASE_PATH}/admin`, adminRouter);

app.use(errorHandler);

// app.use("/uploads", express.static(path.join("uploads")));
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Range");
    res.header(
      "Access-Control-Expose-Headers",
      "Content-Range, Content-Length, Accept-Ranges"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join("uploads"))
);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
