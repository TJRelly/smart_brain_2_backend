const { NotFoundError } = require("../expressError");

// Logging middleware
function logRequest(req, res, next) {
    console.log(`A ${req.method} request is coming to "${req.path}"`);
    // transfer control to the next matching handler
    return next();
}

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

module.exports = { logRequest, handleNotFound, errorHandler };
