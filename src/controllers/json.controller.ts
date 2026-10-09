import { Request, Response } from 'express'
import { jsonSchema, jsonDiffSchema } from '../schemas/json.schema'
import { formatJson, minifyJson } from '../services/json.service';
import { diffJson } from '../services/jsonDiff.service';

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

export function diffJsonController(req: Request, res: Response){
    const { json1, json2 } = jsonDiffSchema.parse(req.body);
    const result = diffJson(json1, json2);
    res.json({
        diff: result
    });
}