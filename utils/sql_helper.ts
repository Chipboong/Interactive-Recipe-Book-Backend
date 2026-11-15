import mysql, {
    type ResultSetHeader,
    type RowDataPacket,
} from "mysql2/promise";

export type AddUserResult =
    | { success: true }
    | {
          success: false;
          error: "DUPLICATE_ENTRY" | "DATABASE_ERROR";
          message: string;
      };
export type GetUserResult = {
    user_id: string;
    username: string;
    email: string;
    password_hash: string;
};

interface UserRow extends RowDataPacket {
    id: string;
    username: string;
    email: string;
    password: string;
}
interface SessionRow extends RowDataPacket {
    id: number;
    session_id: string;
    refresh_id: string;
    refresh_exp_date: Date;
    exp_date: Date;
    user_id: number;
    created_at: Date;
    updated_at: Date;
}
interface RefreshTokenRow extends RowDataPacket {
    refresh_id: string;
}
export async function get_refresh_token(pool: mysql.Pool, user_id: string) {
    const sql = `
        SELECT refresh_id
        FROM sessions
        WHERE user_id = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute<RefreshTokenRow[]>(sql, [user_id]);

    const token = rows[0];

    if (!token) return null;

    return {
        refreshId: token.refresh_id,
    };
}
export async function add_sessions(
    pool: mysql.Pool,
    sessionId: string,
    refreshId: string,
    refreshExpDate: string,
    accessExpDate: string,
    user_id: string,
) {
    const sql = `
        INSERT INTO sessions (
            session_id,
            refresh_id,
            refresh_exp_date,
            exp_date,
            user_id
        )
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            session_id = VALUES(session_id),
            refresh_id = VALUES(refresh_id),
            refresh_exp_date = VALUES(refresh_exp_date),
            exp_date = VALUES(exp_date);
    `;

    await pool.execute(sql, [
        sessionId,
        refreshId,
        refreshExpDate,
        accessExpDate,
        user_id,
    ]);
}
export async function add_user(
    pool: mysql.Pool,
    username: string,
    email: string,
    password: string,
): Promise<AddUserResult> {
    const sql =
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    try {
        const [result] = await pool.execute<ResultSetHeader>(sql, [
            username,
            email,
            password,
        ]);

        if (result.affectedRows === 1) {
            return { success: true };
        }

        return {
            success: false,
            error: "DATABASE_ERROR",
            message: "Insert failed: no rows affected.",
        };
    } catch (err: any) {
        // 'ER_DUP_ENTRY' triggers when a UNIQUE constraint is violated
        if (err?.code === "ER_DUP_ENTRY") {
            return {
                success: false,
                error: "DUPLICATE_ENTRY",
                message: "Username or email already exists.",
            };
        }

        return {
            success: false,
            error: "DATABASE_ERROR",
            message: err?.message || "An unexpected database error occurred.",
        };
    }
}
export async function get_user(
    pool: mysql.Pool,
    email: string,
): Promise<GetUserResult | null> {
    const sql = `
        SELECT id, username, email, password
        FROM users
        WHERE email = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute<UserRow[]>(sql, [email]);

    const user = rows[0];

    if (!user) return null;

    return {
        user_id: user.id,
        username: user.username,
        email: user.email,
        password_hash: user.password,
    };
}
export async function get_user_by_id(
    pool: mysql.Pool,
    id: string,
): Promise<GetUserResult | null> {
    const sql = `
        SELECT id, username, email, password
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute<UserRow[]>(sql, [id]);

    const user = rows[0];

    if (!user) return null;

    return {
        user_id: user.id,
        username: user.username,
        email: user.email,
        password_hash: user.password,
    };
}
