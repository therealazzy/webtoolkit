import { AppError } from "../errors/appError";

function generateInterface(obj: Record<string, unknown>, key: string, optionalKeys: Set<string> = new Set()){
    let nestedInterfaces = "";
    const interfaceName = key.charAt(0).toUpperCase() + key.slice(1);
    let result = `interface ${interfaceName} {\n`;
for(const [nestedKey, nestedValue] of Object.entries(obj)){
    let nestedType: String;
    if(typeof nestedValue === "string"){
        nestedType = "string";
    } else if(typeof nestedValue === "number"){
        nestedType = "number";
    } else if(typeof nestedValue === "boolean"){
        nestedType = "boolean";
    } else if(typeof nestedValue === "object" && nestedValue !== null){
        nestedType = nestedKey.charAt(0).toUpperCase() + nestedKey.slice(1);
        const nestedResult = generateInterface(nestedValue as Record<string, unknown>,nestedKey);
        nestedInterfaces +=  "\n" + nestedResult;
        
    }else {
        throw new AppError("Unsupported nested type", 400);
    }
    result += ` ${nestedKey}${optionalKeys.has(nestedKey) ? "?" : ""}: ${nestedType};\n`;
}
result += "}";
return result + nestedInterfaces;
}

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

            if(typeof element === "string"){
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
                const optionalKeys = getOptionalKeys( value as Record<string, unknown>[],)
                const nestedResult = generateInterface(element as Record<string, unknown>, key, optionalKeys);
                nestedInterfaces += nestedResult;
                type = `${key.charAt(0).toUpperCase() + key.slice(1)}[]`
            }else {
                throw new AppError("Unsupported array type", 400);
            }
        } else if(typeof value === "object" && value !== null){
            const nestedResult = generateInterface(value as Record<string, unknown>, key);
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
