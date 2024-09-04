const { NotFoundError } = require("../expressError");

// 404 handler middleware
function handleNotFound(req, res, next) {
    return next(new NotFoundError());
}

// Error handling middleware
function errorHandler(err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
}

module.exports = { handleNotFound, errorHandler };
