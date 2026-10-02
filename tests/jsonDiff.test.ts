import {diffJson} from "../src/services/jsonDiff.service"
import { describe, expect, it} from "vitest"


describe("jsonDiff", () =>{
    it("detects changed array values", () => {
        const result = diffJson(
            '{"tags":["cpp","python"]}',
            '{"tags":["cpp","typescript"]}'
        );
    
        expect(result).toEqual([
            {
                path: "tags[1]",
                oldValue: "python",
                newValue: "typescript"
            }
        ]);
    });
    
    it("detects added array values", () => {
        const result = diffJson(
            '{"tags":["cpp","python"]}',
            '{"tags":["cpp","python","typescript"]}'
        );
    
        expect(result).toEqual([
            {
                path: "tags[2]",
                oldValue: undefined,
                newValue: "typescript"
            }
        ]);
    });
    
    it("detects removed array values", () => {
        const result = diffJson(
            '{"tags":["cpp","python","typescript"]}',
            '{"tags":["cpp","python"]}'
        );
    
        expect(result).toEqual([
            {
                path: "tags[2]",
                oldValue: "typescript",
                newValue: undefined
            }
        ]);
    }),
    it("detects array to object change", () => {
        const result = diffJson(
            '{"data":["a","b"]}',
            '{"data":{"value":"a"}}'
        );
    
        expect(result).toEqual([
            {
                path: "data",
                oldValue: ["a", "b"],
                newValue: { value: "a" }
            }
        ]);
    });
    
    it("detects object to array change", () => {
        const result = diffJson(
            '{"data":{"value":"a"}}',
            '{"data":["a","b"]}'
        );
    
        expect(result).toEqual([
            {
                path: "data",
                oldValue: { value: "a" },
                newValue: ["a", "b"]
            }
        ]);
    });
})