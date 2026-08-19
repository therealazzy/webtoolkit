import { Request, Response, NextFunction } from "express";
export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
    {
        res.status(500).json({
            error: "something went wrong!"
        });
    }
}