import express from "express";
import { ENV } from "./config/env.js";
const app = express();

app.get("/", (req, res) => {
  res.send("Hellow World !!!");
});

app.listen(ENV.PORT, console.log("Server is running at PORT:", ENV.PORT));
