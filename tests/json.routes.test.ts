import {describe, expect, it } from "vitest"
import request from "supertest"
import app from "../src/app.ts";

describe("test json endpoints", () => {
    it("format endpoint test", async () =>{
        const response = (await request(app).post("/api/v1/json/format").send({
            json: '{"name":"User","role":"Developer"}'
        }));
        expect(response.status).toBe(200); 
        expect(response.body.formatted).toBe(`{\n  "name": "User",\n  "role": "Developer"\n}`);
    }),
    it("minify endpoint test", async () =>{
        const response = (await request(app).post("/api/v1/json/minify").send({
            json: '{"name":    "User",     "role":        "Developer"}'
        }));
        expect(response.status).toBe(200); 
        expect(response.body.minified).toBe('{"name":"User","role":"Developer"}');
    }),
    it("diff endpoint test", async () => {
        const response = (await request(app).post("/api/v1/json/diff").send({
            json1: '{"name":"User","age":25}',
            json2: '{"name":"User","age":26}'
        }));
        expect(response.status).toBe(200);
        expect(response.body.diff).toEqual([
            {   
                path: "age",
                oldValue: 25,
                newValue: 26
            }
        ]);
    }),
    it("diif endpoint invalid input", async () => {
        const response = (await request(app).post("/api/v1/json/diff").send({
            json1: '{"name":"User"',
            json2: '{"name":"User","age":26}'
        }));
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid JSON");
    })
});