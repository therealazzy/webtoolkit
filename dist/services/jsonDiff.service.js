"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffJson = diffJson;
const appError_1 = require("../errors/appError");
function diffJson(json1, json2) {
    let oldValue;
    let newValue;
    try {
        oldValue = JSON.parse(json1);
        newValue = JSON.parse(json2);
    }
    catch {
        throw new appError_1.AppError("Invalid JSON", 400);
    }
    const differences = [];
    function compare(oldValue, newValue, path) {
        // a property only exists in one 
        if (oldValue === undefined || newValue === undefined) {
            if (oldValue !== newValue) {
                differences.push({ path, oldValue, newValue });
            }
            return;
        }
        // primitives
        if (typeof oldValue !== "object" && typeof newValue !== "object") {
            if (oldValue !== newValue) {
                differences.push({ path, oldValue, newValue });
            }
            return;
        }
        // arrays
        if (Array.isArray(oldValue) !== Array.isArray(newValue)) {
            differences.push({ path, oldValue, newValue });
            return;
        }
        // compare arrays by index so changes can be reported at their path
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            const maxLength = Math.max(oldValue.length, newValue.length);
            for (let i = 0; i < maxLength; i++) {
                const newPath = `${path}[${i}]`;
                compare(oldValue[i], newValue[i], newPath);
            }
            return;
        }
        // objects
        if (typeof oldValue === "object" && typeof newValue === "object" && oldValue !== null && newValue !== null) {
            const oldObj = oldValue;
            const newObj = newValue;
            const keys = new Set([
                ...Object.keys(oldObj),
                ...Object.keys(newObj)
            ]);
            for (const key of keys) {
                const newPath = path ? `${path}.${key}` : key;
                compare(oldObj[key], newObj[key], newPath);
            }
        }
    }
    compare(oldValue, newValue, "");
    return differences;
}
