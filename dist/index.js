"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./infrastructure/db"));
const kanban_1 = __importDefault(require("./api/kanban"));
const express_2 = require("@clerk/express");
const cors_1 = __importDefault(require("cors"));
const global_error_handling_middleware_1 = __importDefault(require("./api/middlewares/global-error-handling-middleware"));
// Create an Express instance
const app = (0, express_1.default)();
app.use((0, express_2.clerkMiddleware)());
// Middleware to parse the JSON data in the request body
app.use(express_1.default.json());
app.use((0, cors_1.default)());
(0, db_1.default)();
app.use("/api/kanban", kanban_1.default);
app.use(global_error_handling_middleware_1.default);
// Define the port to run the server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
//# sourceMappingURL=index.js.map