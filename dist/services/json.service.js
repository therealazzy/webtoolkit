"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatJson = formatJson;
exports.minifyJson = minifyJson;
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
function minifyJson(json) {
    try {
        const parsed = JSON.parse(json);
        return JSON.stringify(parsed);
    }
    catch {
        throw new appError_1.AppError("Invalid JSON", 400);
    }
}
