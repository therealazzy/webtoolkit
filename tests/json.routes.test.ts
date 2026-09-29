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
    })
})