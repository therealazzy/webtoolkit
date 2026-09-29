import {describe, expect, it } from "vitest"
import request from "supertest"
import app from "../src/app.ts";

describe("test jwt endpoints", () => {
    it("inspect endpoint test", async () =>{
        const response = (await request(app).post("/api/v1/jwt/inspect").send({
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQXp6eSIsImlhdCI6MTcyMDAwMDAwMCwiZXhwIjoxNzIwMDAzNjAwfQ.7R0r3mW5ZJ8cJ9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q"
        }));
        expect(response.status).toBe(200); 
        expect(response.body).toEqual({
  header: {
    alg: "HS256",
    typ: "JWT",
  },
  metadata: {
    expiresAt: "2024-07-03T10:46:40.000Z",
    isExpired: true,
    issuedAt: "2024-07-03T09:46:40.000Z",
  },
  payload: {
    exp: 1720003600,
    iat: 1720000000,
    name: "Azzy",
    sub: "123",
  },
  signature: "7R0r3mW5ZJ8cJ9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q",
});
    })
})