"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_controller_1 = require("../controllers/jwt.controller");
const router = (0, express_1.Router)();
router.post("/inspect", jwt_controller_1.inspectJwtController);
router.post("/verify", jwt_controller_1.verifyJwtController);
exports.default = router;
