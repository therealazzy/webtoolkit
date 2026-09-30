import { Request, Response } from 'express'
import { jsonSchema } from '../schemas/json.schema'
import { formatJson, minifyJson } from '../services/json.service';

export function formatJsonController(req: Request, res: Response){
    const { json } = jsonSchema.parse(req.body);
    const result = formatJson(json);
    res.json({
        formatted: result
    });
}

export function minifyJsonController(req: Request, res: Response){
    const { json } = jsonSchema.parse(req.body);
    const result = minifyJson(json);
    res.json({
        minified: result
    });
}