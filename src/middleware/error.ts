import type { NextFunction, Request, Response } from "express"
import { UploadError } from "./upload.ts"

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
) {
    if (res.headersSent) return next(err)

    // 1) errors we created on purpose (bad file types, too large, ...)
    if (err instanceof UploadError) {
        return res.status(err.status).json({
            success: false,
            error: err.code,
            message: err.message
        })
    }

    // 2) client mistakes raised by Express/body-parser 
    if (
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        typeof err.status === "number" &&
        err.status >= 400 &&
        err.status < 500
    ) {
        return res.status(err.status).json({
            success: false,
            error: "BAD_REQUEST",
            message: "The request could not be understood."
        })
    }

    // 3) anything else is our bug; so log the details on the SERVER only
    console.error(err);
    return res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "Something went wrong on the server.",
    });
}