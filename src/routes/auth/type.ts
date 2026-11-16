export interface AuthRegisterBody {
    email: string;
    password: string;
    username: string;
}
export interface AuthLoginBody {
    email: string;
    password: string;
}
export interface BasePayload {
    user_id: string;
    iat: number;
    exp: number;
    type: "access" | "refresh";
}

export interface AccessPayload extends BasePayload {
    username: string;
    email: string;
    type: "access";
}

export interface RefreshPayload extends BasePayload {
    nonce: string;
    type: "refresh";
}
