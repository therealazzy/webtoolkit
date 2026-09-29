import { AppError } from "../errors/appError";

export function formatJson(json: string){
    try{
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, 2);
    }catch {
        throw new AppError("Invalid JSON", 400);
    }
}