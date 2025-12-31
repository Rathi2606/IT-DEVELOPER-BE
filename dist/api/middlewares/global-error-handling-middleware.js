"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globalErrorHandlingMiddleware = (error, req, res, next) => {
    console.error("Error:", error);
    if (error.name === "NotFoundError") {
        res.status(404).json({ message: error.message });
        return;
    }
    if (error.name === "ValidationError") {
        res.status(400).json({ message: error.message, error: error.message });
        return;
    }
    if (error.name === "UnauthorizedError") {
        res.status(401).json({ message: error.message });
        return;
    }
    if (error.name === "ForbiddenError") {
        res.status(403).json({ message: error.message });
        return;
    }
    // Log unexpected errors
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
};
exports.default = globalErrorHandlingMiddleware;
//# sourceMappingURL=global-error-handling-middleware.js.map