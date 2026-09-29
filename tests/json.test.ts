import { describe, expect, it} from "vitest"
import { formatJson } from "../src/services/json.service"

describe("formatJson", () => {
    it("formats valid json", () =>{
        const json = '{"name":"Azzy","role":"Developer"}';

        const result = formatJson(json);

        expect(result).toBe(`{\n  "name": "Azzy",\n  "role": "Developer"\n}`);
    }),
    it("rejects invalid json", () => {
        const json = '{"name":"Azzy",}';

        expect(() => formatJson(json)).toThrow("Invalid JSON");
    })
})