import { AppError } from "../errors/appError";

// build an interface from collected properties and recursively generates nested interfaces
// for nested objects and arrays
function generateInterface(properties: Map<string, unknown[]>, key: string, optionalKeys: Set<string> = new Set()){
    // keep the nested interfaces seperate so they can be appended after the current interface
    let nestedInterfaces = "";
    const interfaceName = key.charAt(0).toUpperCase() + key.slice(1);
    let result = `interface ${interfaceName} {\n`;
for(const [nestedKey, nestedValue] of properties){
    let nestedType: String;
    const types = getTypes(nestedValue);
    
    if(types.has("array")) {
        const arrayResult = getArrayType(nestedValue, nestedKey);
        nestedType = arrayResult.type;
        nestedInterfaces += "\n"  + arrayResult.interfaces;
    }else if (typeof nestedValue[0] === "object" && nestedValue[0] !== null){
        nestedType = nestedKey.charAt(0).toUpperCase() + nestedKey.slice(1);
        const properties = collectProperties(nestedValue as Record<string, unknown>[]);
        const optionalKeys = getOptionalKeys(nestedValue as Record<string, unknown>[]);
        // recursively generate an interface for nested objects
        const nestedResult = generateInterface(properties, nestedKey, optionalKeys);

        nestedInterfaces += "\n" + nestedResult;
    }else if(types.size === 1){
        nestedType = [...types][0];
    } else if(types.size > 1){
        nestedType = [...types].join(" | ");
    } else {
        throw new AppError("Unsupported nested type", 400);
    }
    result += ` ${nestedKey}${optionalKeys.has(nestedKey) ? "?" : ""}: ${nestedType};\n`;
}
result += "}";
return result + nestedInterfaces;
}

// collects the disctinct types based on the given values
function getTypes(values: unknown[]) : Set<string> {
    const types = new Set<string>();
    for(const value of values){
        if(typeof value === "string"){
         types.add("string");
        } else if(typeof value === "number"){
            types.add("number");
        } else if(typeof value === "boolean"){
            types.add("boolean");
        } else if(Array.isArray(value)){
            types.add("array");
        } else if(typeof value === "object" && value !== null){
            types.add("object");
        }
    }
    return types;
}

// identifies if a property is optional
// a property is optional if it does not appear in all objects
// they need to be marked as optional in the generated interface
function getOptionalKeys(objects: Record<string, unknown>[]): Set<string>{
    const propertyCounts = new Map<string, number>();

    for(const obj of objects){
        for(const key of Object.keys(obj)){
            const count = propertyCounts.get(key) ?? 0;
            propertyCounts.set(key, count + 1);
        }
    }

    const optionalKeys = new Set<string>();

    for(const [key, count] of propertyCounts){
        if(count < objects.length){
            optionalKeys.add(key);
        }
    }

    return optionalKeys;
}

// groups values by property name so their type can be inferred across objects
function collectProperties(objects: Record<string, unknown>[]) : Map<string, unknown[]> {
    const properties = new Map<string, unknown[]>();

    for(const obj of objects){
        for(const [key, value] of Object.entries(obj)){
            const values = properties.get(key) ?? [];
            values.push(value);
            properties.set(key, values);
        }
    } return properties;
}


// infers an array's element type, handling nested arrays
// returns both the inferred type and the interfaces required by that type
function getArrayType(value: unknown[], key: string): { type: string, interfaces: string } {
    // flatten nested arrays before inferring the element type
    // only flattens one level by default
    const elements = value.flat();
    const element = elements[0];

    if (Array.isArray(element)) {
        const result = getArrayType(elements, key);
        return { type: `${result.type}[]`, interfaces: result.interfaces };
    }

    if (typeof element === "object" && element !== null) {
        // infer an interfact from the array's object elements
        const properties = collectProperties(elements as Record<string, unknown>[]);
        const optionalKeys = getOptionalKeys(elements as Record<string, unknown>[]);
        const nestedResult = generateInterface(properties, key, optionalKeys);

        return { type: `${key.charAt(0).toUpperCase() + key.slice(1)}[]`, interfaces: nestedResult};
    }

    const types = getTypes(elements);

    if (types.size === 1) {
        return {
            type: `${[...types][0]}[]`,
            interfaces: ""
        };
    }

    if (types.size > 1) {
        return { type: `(${[...types].join(" | ")})[]`, interfaces: ""};
    }

    return { type: "unknown[]", interfaces: "" };
}

// parses json and generates a root interface including nested interfaces where needed
export function jsonToTypescript(json: string){
    let parsed;
    try {
    parsed = JSON.parse(json);
    } catch {
    throw new AppError("Invalid JSON", 400);
    }

    let result = "interface Root {\n";
    let nestedInterfaces = "";

    for(const [key, value] of Object.entries(parsed)){
        let type: string;
        if(typeof value === "string"){
            type = "string";
        } else if(typeof value === "number"){
            type = "number";
        } else if(typeof value  === "boolean"){
            type = "boolean"
        } else if(Array.isArray(value)){
            const element  = value[0];

            if(Array.isArray(element)){
                const arrayResult = getArrayType(value, key);

                type = arrayResult.type;
                nestedInterfaces += arrayResult.interfaces;
            }else if(typeof element === "string"){
                type = "string[]"
            }
            else if(typeof element === "number"){
                type = "number[]"
            }
            else if(typeof element === "boolean"){
                type = "boolean[]"
            } else if(typeof element === "undefined"){
                type = "unknown[]"
            }else if(typeof element === "object" && element !== null){
                const properties = collectProperties(value as Record<string, unknown>[]);
                const optionalKeys = getOptionalKeys(value as Record<string, unknown>[]);
                const nestedResult = generateInterface(properties, key, optionalKeys);
                nestedInterfaces += nestedResult;
                type = `${key.charAt(0).toUpperCase() + key.slice(1)}[]`
            }else {
                throw new AppError("Unsupported array type", 400);
            }
        } else if(typeof value === "object" && value !== null){
            const properties = collectProperties([value as Record<string, unknown>]);
            const nestedResult = generateInterface(properties, key);
            nestedInterfaces += nestedResult;
            type = key.charAt(0).toUpperCase() + key.slice(1);
            
        }else{
            throw new AppError("Unsupported type", 400);
        }

        result += ` ${key}: ${type};\n`
    }

    result += "}";
    result += "\n" + nestedInterfaces;
    return result;
}
