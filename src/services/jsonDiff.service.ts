import { AppError } from "../errors/appError";

export function diffJson(json1: string, json2: string){
    let oldValue;
    let newValue;

    try{
        oldValue = JSON.parse(json1);
        newValue = JSON.parse(json2);
    }catch{
        throw new AppError("Invalid JSON", 400);
    }

    const differences: {
        path: string;
        oldValue: unknown;
        newValue: unknown;
    }[] = [];

    function compare(oldValue: unknown, newValue: unknown, path: string) {
        // a property only exists in one 
        if (oldValue === undefined || newValue === undefined) {
            if (oldValue !== newValue) {
                differences.push({ path, oldValue, newValue });
            }
            return;
        }
    
        // primitives
        if (typeof oldValue !== "object" && typeof newValue !== "object") {
            if (oldValue !== newValue) {
                differences.push({ path, oldValue, newValue });
            }
            return;
        }

        // arrays

        if(Array.isArray(oldValue) !== Array.isArray(newValue)){
            differences.push({path, oldValue, newValue});
            return;
        }
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            const maxLength = Math.max(oldValue.length, newValue.length);
        
            for (let i = 0; i < maxLength; i++) {
                const newPath = `${path}[${i}]`;
        
                compare(oldValue[i], newValue[i], newPath);
            }
        
            return;
        }
    
        // objects
        if (typeof oldValue === "object" && typeof newValue === "object" && oldValue !== null && newValue !== null) {
            const oldObj = oldValue as Record<string, unknown>;
            const newObj = newValue as Record<string, unknown>;
    
            const keys = new Set([
                ...Object.keys(oldObj),
                ...Object.keys(newObj)
            ]);
    
            for (const key of keys) {
                const newPath = path ? `${path}.${key}` : key;
    
                compare(oldObj[key], newObj[key], newPath);
            }
        }
    }

    compare(oldValue, newValue, "");
    return differences;
}
