// Central error handler.
// Controllers can pass business errors here instead of duplicating response
// logic. In a horizontally scaled system, this also standardizes API errors
// across future services.
function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
        console.error('Server Error:', error);
    }

    res.status(statusCode).json({
        error: error.message || 'Internal Server Error'
    });
}

module.exports = errorHandler;
