import { Request, Response } from 'express'
import { jsonSchema } from '../schemas/json.schema'
import { formatJson } from '../services/json.service';

export function formatJsonController(req: Request, res: Response){
    const { json } = jsonSchema.parse(req.body);
    const result = formatJson(json);
    res.json({
        formatted: result
    });
}