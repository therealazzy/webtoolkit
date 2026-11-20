import { Request, Response} from 'express'
import { getDbHealth } from '../services/health.service'

export async function readiness(req: Request, res: Response){
    const alive = await getDbHealth();
    if(!alive){
        req.log.warn("Database connection not alive");
        return res.status(503).json({health: "unavailable"});
    }
    res.status(200).json({health: "ok"});
}

export function liveness(req: Request, res: Response){
    res.status(200).json({health: "ok"});
}