import { getEnv } from "../utils/helper";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  ALLOW_ORIGIN: getEnv("ALLOW_ORIGIN", "localhost"),
  PORT: getEnv("PORT", "5000"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  MONGO_URI: getEnv("MONGO_URI", "mongodb://localhost:27017/yourdb"),
  JWT: {
    SECRET: getEnv("JWT_SECRET", "your_secret_key"),
    EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "86400"), //15 min
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "your_refresh_secret_key"),
    REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
  },
});

export const config = appConfig();
