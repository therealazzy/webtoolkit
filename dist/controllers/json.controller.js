"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatJsonController = formatJsonController;
exports.minifyJsonController = minifyJsonController;
const json_schema_1 = require("../schemas/json.schema");
const json_service_1 = require("../services/json.service");
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
