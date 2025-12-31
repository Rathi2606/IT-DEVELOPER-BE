import { Request, Response, NextFunction } from "express";

const globalErrorHandlingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export default globalErrorHandlingMiddleware;