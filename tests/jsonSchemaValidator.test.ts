import { validateJson } from "../src/services/jsonSchemaValidator.service"
import { describe, expect, it} from "vitest"

describe("json schema validator tests", () => {
    it("accepts valid inputs", ()=>{

        const data = JSON.stringify({
            age: 25
        });
        const schema = JSON.stringify({
            type: "object",
            properties: {
                age: {type: "number"}
            },
            required: ["age"]
        });

        const result = validateJson(data, schema);

        expect(result.valid).toBe(true);
        expect(result.errors).toBeNull();
    }),
    it("should throw an error when the schema is invalid JSON", () => {
        const data = JSON.stringify({ age: 25 });
        const schema = '{"type": "object"';
    
        expect(() => validateJson(data, schema)).toThrow("Invalid JSON");
    }),
    it("rejects json that doesn't match schema", ()=>{

        const data = JSON.stringify({
            age: "25"
        });
        const schema = JSON.stringify({
            type: "object",
            properties: {
                age: {type: "number"}
            },
            required: ["age"]
        });

        const result = validateJson(data, schema);

        expect(result.valid).toBe(false);
        expect(result.errors).not.toBeNull();
    }),
    it("should throw an error when the data is invalid JSON", () => {
        const data = '{"age": 25';
        const schema = JSON.stringify({
            type: "object",
            properties: {
                age: { type: "number" }
            }
        });
    
        expect(() => validateJson(data, schema)).toThrow("Invalid JSON");
    }),
    it("should throw an error when the schema is invalid", () => {
        const data = JSON.stringify({ age: 25 });
        const schema = JSON.stringify({
            type: "banana"
        });
    
        expect(() => validateJson(data, schema)).toThrow("Invalid JSON schema");
    }),
    it("should reject a number below the minimum", () => {
        const data = JSON.stringify({ age: 16 });
    
        const schema = JSON.stringify({
            type: "object",
            properties: {
                age: {
                    type: "number",
                    minimum: 18
                }
            },
            required: ["age"]
        });
    
        const result = validateJson(data, schema);
    
        expect(result.valid).toBe(false);
        expect(result.errors).not.toBeNull();
    }),
    it("should reject a number above the maximum", () => {
        const data = JSON.stringify({ score: 110 });
    
        const schema = JSON.stringify({
            type: "object",
            properties: {
                score: {
                    type: "number",
                    maximum: 100
                }
            },
            required: ["score"]
        });
    
        const result = validateJson(data, schema);
    
        expect(result.valid).toBe(false);
        expect(result.errors).not.toBeNull();
    }),
    it("should reject data missing a required property", () => {
        const data = JSON.stringify({ name: "Arslan" });
    
        const schema = JSON.stringify({
            type: "object",
            properties: {
                name: { type: "string" },
                age: { type: "number" }
            },
            required: ["name", "age"]
        });
    
        const result = validateJson(data, schema);
    
        expect(result.valid).toBe(false);
        expect(result.errors).not.toBeNull();
    }),
    it("should reject a string shorter than the minimum length", () => {
        const data = JSON.stringify({ username: "Al" });
    
        const schema = JSON.stringify({
            type: "object",
            properties: {
                username: {
                    type: "string",
                    minLength: 3
                }
            },
            required: ["username"]
        });
    
        const result = validateJson(data, schema);
    
        expect(result.valid).toBe(false);
        expect(result.errors).not.toBeNull();
    });
})