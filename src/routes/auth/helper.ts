import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { BasePayload, AccessPayload, RefreshPayload } from "./type.ts";

export function gen_access_token(
    secret: string,
    user_id: string,
    username: string,
    email: string,
): { token: string; exp: string } {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60; // 1 hour
    const payload = {
        user_id: user_id,
        username: username,
        email: email,
        iat: iat,
        exp: exp,
        type: "access",
    };
    const encodedPayload = Buffer.from(
        JSON.stringify(payload),
        "utf-8",
    ).toString("base64url");

    const signature = createHmac("sha512", secret)
        .update(encodedPayload)
        .digest("base64url");

    return { token: `${encodedPayload}.${signature}`, exp: exp.toString() };
}
export function gen_refresh_token(
    secret: string,
    user_id: string,
): { token: string; exp: string } {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 24 * 60 * 60; // 1 day
    const payload = {
        user_id: user_id,
        nonce: randomBytes(32).toString("hex"),
        iat: iat,
        exp: exp,
        type: "refresh",
    };
    const encodedPayload = Buffer.from(
        JSON.stringify(payload),
        "utf-8",
    ).toString("base64url");

    const signature = createHmac("sha512", secret)
        .update(encodedPayload)
        .digest("base64url");

    return { token: `${encodedPayload}.${signature}`, exp: exp.toString() };
}

function verify_token<T extends BasePayload>(
    token: string,
    secret: string,
    expected_type: "access" | "refresh",
): T | null {
    try {
        const parts = token.split(".");

        if (parts.length !== 2) return null;

        const [encodedPayload, encodedSignature] = parts;

        if (!encodedPayload || !encodedSignature) return null;

        const base64url_regex = /^[A-Za-z0-9_-]+$/;

        if (
            !base64url_regex.test(encodedPayload) ||
            !base64url_regex.test(encodedSignature)
        ) {
            return null;
        }

        const expectedSignature = createHmac("sha512", secret)
            .update(encodedPayload)
            .digest();

        const receivedSignature = Buffer.from(encodedSignature, "base64url");

        if (
            receivedSignature.length !== expectedSignature.length ||
            !timingSafeEqual(receivedSignature, expectedSignature)
        ) {
            return null;
        }

        const payload: unknown = JSON.parse(
            Buffer.from(encodedPayload, "base64url").toString("utf-8"),
        );

        if (
            typeof payload !== "object" ||
            payload === null ||
            Array.isArray(payload)
        ) {
            return null;
        }

        const data = payload as Record<string, unknown>;

        if (
            typeof data.user_id !== "string" ||
            !Number.isSafeInteger(data.iat) ||
            !Number.isSafeInteger(data.exp) ||
            data.type !== expected_type
        ) {
            return null;
        }

        const now = Math.floor(Date.now() / 1000);

        if (
            (data.exp as number) <= now ||
            (data.exp as number) <= (data.iat as number) ||
            (data.iat as number) > now + 30
        ) {
            return null;
        }

        if (expected_type === "access") {
            if (
                typeof data.username !== "string" ||
                typeof data.email !== "string"
            ) {
                return null;
            }
        } else {
            if (typeof data.nonce !== "string") {
                return null;
            }
        }

        return data as T;
    } catch {
        return null;
    }
}

export function verify_access_token(
    token: string,
    secret: string,
): AccessPayload | null {
    return verify_token<AccessPayload>(token, secret, "access");
}

export function verify_refresh_token(
    token: string,
    secret: string,
): RefreshPayload | null {
    return verify_token<RefreshPayload>(token, secret, "refresh");
}
