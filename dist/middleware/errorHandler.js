"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const appError_1 = require("../errors/appError");
function errorHandler(error, req, res, next) {
    {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: "Invalid request"
            });
        }
        if (error instanceof appError_1.AppError) {
            return res.status(error.statusCode).json({
                error: error.message
            });
        }
        return res.status(500).json({
            error: "something went wrong!"
        });
    }
}
