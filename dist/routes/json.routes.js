"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const json_controller_1 = require("../controllers/json.controller");
const router = (0, express_1.Router)();
router.post("/format", json_controller_1.formatJsonController);
router.post("/minify", json_controller_1.minifyJsonController);
exports.default = router;
