"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectJwtController = inspectJwtController;
const jwt_service_1 = require("../services/jwt.service");
const jwt_schema_1 = require("../schemas/jwt.schema");
function inspectJwtController(req, res) {
    const { token } = jwt_schema_1.jwtSchema.parse(req.body);
    const result = (0, jwt_service_1.inspectJwt)(token);
    res.json(result);
}
