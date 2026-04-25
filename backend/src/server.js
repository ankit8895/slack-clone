import { clerkMiddleware } from "@clerk/express";
import express from "express";
import { serve } from "inngest/express";
import "../instrument.mjs";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import { functions, inngest } from "./config/inngest.js";
import chatRoutes from "./routes/chat.route.js";

import cors from "cors";

import * as Sentry from "@sentry/node";

const app = express();

app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // req.auth will be available in the request object

app.get("/debug-sentry", (req, res) => {
  throw new Error("My first Sentry error!");
});

app.get("/", (req, res) => {
  res.send("Hellow World !!!");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);

Sentry.setupExpressErrorHandler(app);

const startServer = async () => {
  try {
    await connectDB();
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => {
        console.log("Server is running at PORT:", ENV.PORT);
      });
    }
  } catch (error) {
    console.error("Error in starting the server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
