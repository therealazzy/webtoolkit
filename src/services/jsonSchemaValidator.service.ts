import { AppError } from "../errors/appError";
import Ajv, { ValidateFunction } from "ajv";

export function validateJson(json: string, schema: string){
    const ajv = new Ajv();
    let parsed;
    let pSchema;
    let validate : ValidateFunction;
    try {
        parsed = JSON.parse(json);
        pSchema = JSON.parse(schema);
        } catch {
        throw new AppError("Invalid JSON", 400);
        }

        try{
            validate = ajv.compile(pSchema);
        } catch{
            throw new AppError("Invalid JSON schema", 400);
        }

        const valid = validate(parsed);

        return {
            valid,
            errors: validate.errors ?? null
        };

}