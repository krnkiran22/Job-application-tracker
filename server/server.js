import express from "express";
const app = express();
import "express-async-errors";

import dotenv from "dotenv";
dotenv.config();

// ------------DB & AuthenticateUser------------ //
import connectDB from "./db/connect.js";
import morgan from "morgan";

// ------------Routers------------ //
import authRouter from "./routes/authRoutes.js";
import jobsRouter from "./routes/jobsRouter.js";

// ------------middleware------------ //
import notFoundMiddleware from "./middlewares/not-found.js";
import errorHandlerMiddleware from "./middlewares/error-handler.js";
import authenticateUser from "./middlewares/auth.js";

// ------------Security Packages------------ //
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

// ------------Production------------ //
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

// -------------------------------------------------------------- //

const __dirname = dirname(fileURLToPath(import.meta.url)); // because we're using ES6-modules not common.js

app.use(express.json()); // make json-data available
app.use(helmet()); // secure Express-app by setting various HTTP headers
app.use(xss()); // sanitize user input
app.use(mongoSanitize()); // prevent MongoDB Operator Injection

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// API routes
app.get("/api/v1", (req, res) => {
  res.json({ message: "Welcome!" });
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

// Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Export the app
export default async function handler(req, res) {
  await connectDB(process.env.MONGO_URL); // Ensure DB is connected
  return app(req, res); // Pass the request to Express
}
