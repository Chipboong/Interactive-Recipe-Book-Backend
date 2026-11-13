import express, { type Request, type Response } from "express";
import * as argon2 from "argon2";
import type { AuthRegisterBody } from "./type.ts";
import { email_validate, password_validate } from "../../../utils/validator.ts";
import { add_user } from "../../../utils/sql_helper.ts";
import { pool } from "../../../utils/db.ts";
const authRoute = express.Router();

authRoute.post("/register", async (req: Request, res: Response) => {
    const { email, username, password } = (req.body ??
        {}) as Partial<AuthRegisterBody>;

    if (
        typeof username !== "string" ||
        !username.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            error: "MISSING_FIELDS",
            message: "Username, email, and password are all required.",
        });
    }
    if (!email_validate(email.trim().toLowerCase())) {
        return res.status(400).json({
            success: false,
            error: "INVALID_FIELDS",
            message: "Email is not valid.",
        });
    }
    if (!password_validate(password)) {
        return res.status(400).json({
            success: false,
            error: "WEAK_PASSWORD",
            message:
                "Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character.",
        });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    if (normalizedUsername.length < 3) {
        return res.status(400).json({
            success: false,
            error: "INVALID_FIELDS",
            message: "Username must contain at least 3 characters.",
        });
    }
    const password_hash = await argon2.hash(password);
    const result = await add_user(
        pool,
        normalizedUsername,
        normalizedEmail,
        password_hash,
    );
    if (!result.success) {
        if (result.error == "DUPLICATE_ENTRY") {
            return res.status(409).json(result);
        }
        if (result.error == "DATABASE_ERROR") {
            return res.status(503).json(result);
        }
    }
    return res.status(201).json(result);
});

export default authRoute;
