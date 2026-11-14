import express, { type Request, type Response } from "express";
import * as argon2 from "argon2";
import type { AuthLoginBody, AuthRegisterBody } from "./type.ts";
import { email_validate, password_validate } from "../../../utils/validator.ts";
import {
    add_sessions,
    add_user,
    get_refresh_token,
    get_user,
    get_user_by_id,
} from "../../../utils/sql_helper.ts";
import { pool } from "../../../utils/db.ts";
import {
    gen_access_token,
    gen_refresh_token,
    verify_refresh_token,
} from "./helper.ts";
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
authRoute.post("/login", async (req: Request, res: Response) => {
    const { email, password } = (req.body ?? {}) as Partial<AuthLoginBody>;

    if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            error: "MISSING_FIELDS",
            message: "Email, and password are all required.",
        });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!email_validate(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            error: "INVALID_FIELDS",
            message: "Email is not valid.",
        });
    }
    const user = await get_user(pool, normalizedEmail);
    if (!user) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Invalid email or password",
        });
    }
    const password_verify = await argon2.verify(user.password_hash, password);

    // the return here needed to be the same as email.
    if (!password_verify) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Invalid email or password",
        });
    }
    // now in this place the user has valid email, and valid password.
    const access_token = gen_access_token(
        process.env.SECRET_ACCESS as string,
        user.user_id,
        user.username,
        user.email,
    );
    const refresh_token = gen_refresh_token(
        process.env.SECRET_REFRESH as string,
        user.user_id,
    );
    await add_sessions(
        pool,
        access_token.token,
        refresh_token.token,
        refresh_token.exp,
        access_token.exp,
        user.user_id,
    );
    res.cookie("refresh_token", refresh_token.token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/api/v1/auth/refresh",
    });
    res.cookie("access_token", access_token.token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
        path: "/",
    });
    return res.status(200).json({
        success: true,
    });
});
authRoute.post("/refresh", async (req: Request, res: Response) => {
    const token = req.cookies.refresh_token;
    if (!token) {
        return res.status(403).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Invalid request",
        });
    }
    const verification = verify_refresh_token(
        token,
        process.env.SECRET_REFRESH!,
    );
    // it mean the token is expire, or invalid
    // we also need it to have the same response
    if (!verification || verification == null) {
        return res.status(403).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Invalid request",
        });
    }
    const token_from_db = await get_refresh_token(pool, verification!.user_id);

    if (!token_from_db || token_from_db.refreshId != token) {
        // Something incredibly went wrong,
        // it mean our SECRET Is exposed.
        return res.status(403).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Invalid request",
        });
    }
    const user = await get_user_by_id(pool, verification!.user_id);
    if (!user) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "Invalid email or password",
        });
    }
    const access_token = gen_access_token(
        process.env.SECRET_ACCESS as string,
        user.user_id,
        user.username,
        user.email,
    );
    const refresh_token = gen_refresh_token(
        process.env.SECRET_REFRESH as string,
        user.user_id,
    );
    await add_sessions(
        pool,
        access_token.token,
        refresh_token.token,
        refresh_token.exp,
        access_token.exp,
        user.user_id,
    );
    res.cookie("refresh_token", refresh_token.token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/api/v1/auth/refresh",
    });
    res.cookie("access_token", access_token.token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
        path: "/",
    });
    return res.status(200).json({
        success: true,
    });
});
export default authRoute;
