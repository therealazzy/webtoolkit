"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(error, req, res, next) {
    {
        res.status(500).json({
            error: "something went wrong!"
        });
    }
}
