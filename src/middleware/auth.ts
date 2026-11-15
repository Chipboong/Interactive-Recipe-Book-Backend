import { type Request, type Response, type NextFunction } from "express";
import { verify_access_token } from "../routes/auth/helper.ts";
export interface AuthRequest extends Request {
    user?: {
        user_id: string;
        username: string;
        email: string;
    };
}

export function auth_middleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): void {
    const token = req.cookies?.access_token;

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });
        return;
    }

    const payload = verify_access_token(token, process.env.SECRET_ACCESS!);

    if (!payload) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
        });
        return;
    }

    req.user = {
        user_id: payload.user_id,
        username: payload.username,
        email: payload.email,
    };

    next();
}
