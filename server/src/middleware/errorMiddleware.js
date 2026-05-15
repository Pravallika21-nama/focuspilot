export function notFound(req, res, next) {
  const error = new Error(`Not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = error.name === "MongoServerError" && error.code === 11000
    ? "This email is already registered"
    : error.message || "Server error";

  res.status(status).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
}
