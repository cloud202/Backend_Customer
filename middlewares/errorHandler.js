const { ValidationError } = require('joi');
const CustomErrorHandler = require('../services/CustomErrorHandler');

const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let data = {
        message: err.message
    }

    if (err instanceof ValidationError) {
        statusCode = 422;
    }

    if (err instanceof CustomErrorHandler) {
        statusCode = err.status;
    }

    return res.status(statusCode).json(data);
};

module.exports = errorHandler;