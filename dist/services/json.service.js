"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatJson = formatJson;
const appError_1 = require("../errors/appError");
function formatJson(json) {
    try {
        const parsed = JSON.parse(json);
        return JSON.stringify(parsed, null, 2);
    }
    catch {
        throw new appError_1.AppError("Invalid JSON", 400);
    }
}
