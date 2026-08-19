"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectJwtController = inspectJwtController;
const jwt_service_1 = require("../services/jwt.service");
function inspectJwtController(req, res) {
    const { token } = req.body;
    const result = (0, jwt_service_1.inspectJwt)(token);
    res.json(result);
}
