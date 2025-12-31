import "dotenv/config";
import express from "express";
import connectDB from "./infrastructure/db";
import kanbanRouter from "./api/kanban";
import { clerkMiddleware } from "@clerk/express";

import cors from "cors";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handling-middleware";

// Create an Express instance
const app = express();

app.use(clerkMiddleware());
// Middleware to parse the JSON data in the request body
app.use(express.json());
app.use(cors({ origin: "https://it-developer-rathi.netlify.app" }));

connectDB();

app.use("/api/kanban", kanbanRouter);

app.use(globalErrorHandlingMiddleware);

// Define the port to run the server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));