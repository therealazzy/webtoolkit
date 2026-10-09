"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatJsonController = formatJsonController;
exports.minifyJsonController = minifyJsonController;
exports.diffJsonController = diffJsonController;
exports.validateJsonController = validateJsonController;
const json_schema_1 = require("../schemas/json.schema");
const json_service_1 = require("../services/json.service");
const jsonDiff_service_1 = require("../services/jsonDiff.service");
const jsonSchemaValidator_service_1 = require("../services/jsonSchemaValidator.service");
function formatJsonController(req, res) {
    const { json } = json_schema_1.jsonSchema.parse(req.body);
    const result = (0, json_service_1.formatJson)(json);
    res.json({
        formatted: result
    });
}
function minifyJsonController(req, res) {
    const { json } = json_schema_1.jsonSchema.parse(req.body);
    const result = (0, json_service_1.minifyJson)(json);
    res.json({
        minified: result
    });
}
function diffJsonController(req, res) {
    const { json1, json2 } = json_schema_1.jsonDiffSchema.parse(req.body);
    const result = (0, jsonDiff_service_1.diffJson)(json1, json2);
    res.json({
        diff: result
    });
}
function validateJsonController(req, res) {
    const { data, schema } = json_schema_1.validateSchema.parse(req.body);
    const result = (0, jsonSchemaValidator_service_1.validateJson)(data, schema);
    res.json(result);
}
