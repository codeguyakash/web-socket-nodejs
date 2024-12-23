const { ApiError } = require('../utils/api.error');

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
        });
    }

    console.error('Unexpected Error:', err);
    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        errors: [err.message],
    });
};

module.exports = errorHandler;