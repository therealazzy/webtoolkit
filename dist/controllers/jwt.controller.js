"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectJwtController = inspectJwtController;
exports.verifyJwtController = verifyJwtController;
const jwt_service_1 = require("../services/jwt.service");
const jwtVerification_service_1 = require("../services/jwtVerification.service");
const jwt_schema_1 = require("../schemas/jwt.schema");
function inspectJwtController(req, res) {
    const { token } = jwt_schema_1.jwtSchema.parse(req.body);
    const result = (0, jwt_service_1.inspectJwt)(token);
    res.json(result);
}
function verifyJwtController(req, res) {
    const { token, key } = jwt_schema_1.verifyJwtSchema.parse(req.body);
    (0, jwtVerification_service_1.verifyJwt)(token, key);
    res.json({
        valid: true
    });
}
