import { describe, expect, it} from "vitest"
import {jsonToTypescript } from "../src/services/jsonToTypescript.service"

describe("jsonToTypescript tests", () =>{
    it("accepts valid json", ()=> {
        const json = `{
        "id": 123,
        "name": "Azzy",
        "active": true
    }`;
    const result = jsonToTypescript(json);
    expect(result).toBe(`interface Root {\n id: number;\n name: string;\n active: boolean;\n}\n`)


    }),
    it("rejects invalid json", () => {
        const json = '{"name":"User",}';

        expect(() => jsonToTypescript(json)).toThrow("Invalid JSON");
    }),
    it("accepts number array type", ()=>{
        const json = `{"scores": [10, 20, 30]}`;

        const result = jsonToTypescript(json);
        expect(result).toBe(`interface Root {\n scores: number[];\n}\n`)
    }),
    it("accepts boolean array type", () =>{
        const json = `{"flags": [true, false]}`;

        const result = jsonToTypescript(json);
        expect(result).toBe(`interface Root {\n flags: boolean[];\n}\n`)
    }),
    it("accepts string array type", () =>{
        const json = `{"skills":["C++", "Typescript"]}`;
        
        const result = jsonToTypescript(json);
        expect(result).toBe(`interface Root {\n skills: string[];\n}\n`)
    }),
    it("correctly accepts array of undefined", () =>{
        const json = `{"skills":[]}`;

        const result = jsonToTypescript(json);
        expect(result).toBe(`interface Root {\n skills: unknown[];\n}\n`)
    }),
    it("accepts nested object", () =>{
        const json = `{\n"name": "User",\n"address": {\n "city" : "Manchester",\n "postcode": "M1"\n}\n}`;
        const result = jsonToTypescript(json);

        expect(result).toBe(`interface Root {
 name: string;
 address: Address;
}
interface Address {
 city: string;
 postcode: string;
}`);
    }),
    it("accepts object nested in object", () =>{
    const json = `{\n"name": "User",\n"address": {\n "city" : "Manchester",\n "location": {\n "latitude" : 53.48,\n"longitude": -2.24}\n}\n}`;
    const result = jsonToTypescript(json);

    expect(result).toBe(`interface Root {
 name: string;
 address: Address;
}
interface Address {
 city: string;
 location: Location;
}\ninterface Location {
 latitude: number;
 longitude: number;
}`);
    }),
    it("accepts array of objects", () =>{
    const json = `{
    "users": [
        {
            "name": "User",
            "age": 26
        }
    ]
}`;

    const result = jsonToTypescript(json);
    expect(result).toBe(`interface Root {
 users: Users[];
}
interface Users {
 name: string;
 age: number;
}`);
    }),
    it("accepts array of objects while detecting varying types", () =>{
    const json = `{
  "users": [
    { "name": "Azzy", "score": 6 },
    { "name": "Bob", "score": "seven" }
  ]
}`;

    const result = jsonToTypescript(json);
    expect(result).toBe(`interface Root {
 users: Users[];
}
interface Users {
 name: string;
 score: number | string;
}`)

    }),
    it("accepts nested objects with optiona fields", () =>{
        const json = `{
        "users": [
            {
                "name": "Azzy",
                "address": {
                    "city": "Manchester"
                }
            },
            {
                "name": "Bob",
                "address": {
                    "city": "London",
                    "postcode": "E1"
                }
            }
        ]
    }`;
        const result = jsonToTypescript(json);
        expect(result).toBe(`interface Root {
 users: Users[];
}
interface Users {
 name: string;
 address: Address;
}
interface Address {
 city: string;
 postcode?: string;
}`);
    }),
    it("accepts nested arrays", () =>{
        const json = `{

        "users": [

            {

                "name": "Azzy",

                "tags": ["cpp", "typescript"]

            }

        ]

    }`;

    const result = jsonToTypescript(json);

    expect(result).toBe(`interface Root {
 users: Users[];
}
interface Users {
 name: string;
 tags: string[];
}\n`);
    }),
    it("handles deeply nested objects and arrays with optional fields", () => {
        const json = `{
            "users": [
                {
                    "name": "Azzy",
                    "profile": {
                        "settings": {
                            "themes": [
                                {
                                    "name": "dark",
                                    "enabled": true
                                },
                                {
                                    "name": "light"
                                }
                            ]
                        }
                    }
                },
                {
                    "name": "Bob",
                    "profile": {
                        "settings": {
                            "themes": [
                                {
                                    "name": "dark",
                                    "enabled": false
                                }
                            ],
                            "language": "en"
                        }
                    }
                }
            ]
        }`;
    
        const result = jsonToTypescript(json);
    
        expect(result).toBe(`interface Root {\n users: Users[];\n}\ninterface Users {\n name: string;\n profile: Profile;\n}\ninterface Profile {\n settings: Settings;\n}\ninterface Settings {\n themes: Themes[];\n language?: string;\n}\ninterface Themes {\n name: string;\n enabled?: boolean;\n}`);
    });
})