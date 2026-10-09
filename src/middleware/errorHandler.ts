import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../errors/appError";

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
    {
        // handle client errors
        if(error instanceof z.ZodError){
            return res.status(400).json({
                error: "Invalid request"
            })
        }
        if(error instanceof AppError){
            return res.status(error.statusCode).json({
                error: error.message
            })
        }
        // any other error is simply a generic 505
            return res.status(500).json({
            error: "something went wrong!"
        });
    }
}