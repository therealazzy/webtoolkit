"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJson = validateJson;
const appError_1 = require("../errors/appError");
const ajv_1 = __importDefault(require("ajv"));
function validateJson(json, schema) {
    const ajv = new ajv_1.default();
    let parsed;
    let pSchema;
    let validate;
    try {
        parsed = JSON.parse(json);
        pSchema = JSON.parse(schema);
    }
    catch {
        throw new appError_1.AppError("Invalid JSON", 400);
    }
    try {
        validate = ajv.compile(pSchema);
    }
    catch {
        throw new appError_1.AppError("Invalid JSON schema", 400);
    }
    const valid = validate(parsed);
    return {
        valid,
        errors: validate.errors ?? null
    };
}
