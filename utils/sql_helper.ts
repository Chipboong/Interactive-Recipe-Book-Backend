import mysql, { type FieldPacket, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

export type AddUserResult =
    | { success: true }
    | {
          success: false;
          error: "DUPLICATE_ENTRY" | "DATABASE_ERROR";
          message: string;
      };

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

export async function getRecipe(pool: mysql.Pool) {
    const query = "SELECT * FROM recipes";
    try{
    const [result] = await pool.execute<RowDataPacket[]>(query);
    console.log(result)
    return result;
} catch (err) {
    return "faild";
}

    
    
}