import { verifyJwt } from "../src/services/jwtVerification.service";
import {describe, it, expect } from "vitest";
import crypto from "crypto";

describe("verifyJwt", () => {
    it("accepts a valid HS256 token", () =>{
        const secret = "test-secret";
        const header = {
            alg: "HS256",
            typ: "JWT"
        };
        const payload = {
            sub: "123",
            name: "Test User"
        };
        const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
        const signing = `${encodedHeader}.${encodedPayload}`;

        const signature = crypto.createHmac("sha256", secret).update(signing).digest("base64url");
        const token = `${signing}.${signature}`;
        verifyJwt(token, secret);
    }),
    it("rejects an HS256 token with the wrong secret", () =>{
        const secret = "test-secret";
        const header = {
            alg: "HS256",
            typ: "JWT"
        };
        const payload = {
            sub: "123",
            name: "Test User"
        };
        const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
        const signing = `${encodedHeader}.${encodedPayload}`;

        const signature = crypto.createHmac("sha256", secret).update(signing).digest("base64url");
        const token = `${signing}.${signature}`;
        const wrongsecret = "non-secret"
        expect(() => verifyJwt(token, wrongsecret)).toThrow("Invalid signature");
    })
})