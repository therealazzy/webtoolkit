import { verifyJwt } from "../src/services/jwtVerification.service";
import {describe, it, expect } from "vitest";
import crypto, { sign } from "crypto";
import { constants } from "buffer";

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
    }),
    it("accepts a valid RS256 token", ()=>{
        const { privateKey, publicKey} = crypto.generateKeyPairSync("rsa", {modulusLength: 2048,});

        const header = { 
            alg: "RS256",
            typ: "JWT"
        };

        const payload = {
            sub: "123",
            name: "Test User"
        };

        const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
        const signing = `${encodedHeader}.${encodedPayload}`;

        const signature = crypto.sign("RSA-SHA256", Buffer.from(signing), privateKey).toString("base64url");
        const token = `${signing}.${signature}`;

        const pKey = publicKey.export({
            type: "spki",
            format: "pem"
        }).toString();

        verifyJwt(token, pKey);
    }),
    it("rejects an RS256 token with invalid signature", () =>{
        const { privateKey, publicKey} = crypto.generateKeyPairSync("rsa", {modulusLength: 2048,});

        const header = { 
            alg: "RS256",
            typ: "JWT"
        };

        const payload = {
            sub: "123",
            name: "Test User"
        };

        const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
        const signing = `${encodedHeader}.${encodedPayload}`;
        const token = `${signing}.invalidsignature`;

        const pKey = publicKey.export({
            type: "spki",
            format: "pem"
        }).toString();

        expect(() => verifyJwt(token, pKey)).toThrow("Invalid signature");
    }),
    it("rejects unsupported algorithm type", () =>{
        const header = {
            alg: "HS512",
            typ: "JWT"
        };
        const payload = {
            sub: "123",
            name: "Test User"
        };

        const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
        const signing = `${encodedHeader}.${encodedPayload}`;

        const token = `${signing}.fakesignature`;
        expect(() => verifyJwt(token, "fake-key")).toThrow("Algo not supported");
    }),
    it("rejects an invalid JWT structure", () =>{
        const token = "not.a.valid.jwt.token";
        expect(() => verifyJwt(token, "fake-key")).toThrow("Invalid jwt");
    }),
    it("rejects an RS256 token with an invalid public key", ()=>{
        const {privateKey } = crypto.generateKeyPairSync("rsa",{
            modulusLength: 2048,
        });

        const header = {
            alg: "RS256",
            typ: "JWT"
        };

        const payload = {
            sub: "123",
            name: "Test-User"
        };

        const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
        const signing = `${encodedHeader}.${encodedPayload}`;
        
        const signature = crypto.sign("RSA-SHA256", Buffer.from(signing), privateKey).toString("base64url");
        const token = `${signing}.${signature}`;

        const invalidPublikKey = "not-a-valid-public-key";
        
        expect(()=> verifyJwt(token, invalidPublikKey)).toThrow();
    })
})