const env = require('../config/env');

function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || 500;
    const isProduction = env.nodeEnv === 'production';

    console.error('Request Error:', {
        method: req.method,
        path: req.originalUrl,
        statusCode,
        message: error.message,
        stack: error.stack
    });

    res.status(statusCode).json({
        error: isProduction && statusCode >= 500
            ? 'Oops, something went wrong.'
            : error.message || 'Internal Server Error'
    });
}

module.exports = errorHandler;
