import { vi, describe, it, expect} from "vitest";
import request from "supertest";
import app from "../src/app";

vi.mock("../src/lib/prisma", ()=>({
    prisma: {}
}));

describe("app level route tests", () =>{
    it("returns placeholder for root route", async() =>{
        const response = await request(app).get("/");
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            name: "WebToolkit API", version: "1", health: "/health" 
        });
    }),
    it("returns a 404 when an unknown route is requested", async() =>{

        const response = await request(app).get("/gibberish");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: "Not found" 
        });
    })
})