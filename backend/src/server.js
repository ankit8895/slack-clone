import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { functions, inngest } from "./config/inngest.js";
import { serve } from "inngest/express";

const app = express();

app.use(express.json());
app.use(clerkMiddleware()); // req.auth will be available in the request object

if (ENV.NODE_ENV === "production") {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      console.error("DB connection error:", error);
      res.status(500).send("Database connection failed");
    }
  });
}

app.get("/", (req, res) => {
  res.send("Hellow World !!!");
});

// app.listen(ENV.PORT, () => {
//   console.log("Server is running at PORT:", ENV.PORT);
//   connectDB();
// });

if (ENV.NODE_ENV !== "production") {
  const startServer = async () => {
    try {
      await connectDB();

      app.listen(ENV.PORT, () => {
        console.log("Server is running at PORT:", ENV.PORT);
      });
    } catch (error) {
      console.error("Error in starting the server:", error);
      process.exit(1);
    }
  };

  startServer();
}

export default app;
