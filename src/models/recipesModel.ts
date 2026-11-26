import mysql, {
    type ResultSetHeader,
    type RowDataPacket,
} from "mysql2/promise";
import { detectImageType } from "../middleware/upload";
// import { pool } from "../../utils/db.ts"

export interface RecipePayload {
    title: string;
    description: string;
    category: string;
    prep_time_mins: string;
    ingredient: string;
    image: Buffer | null;
    status: string;
    user_id: number;
}
export interface RecipeFilter {
    ingredient?: string;
    category?: string;
}

export async function getRecipes(
    pool: mysql.Pool,
    queryData: {
        ingredient: string | null;
        category: string | null;
    } = {
        ingredient: null,
        category: null,
    },
) {
    let query =
        "SELECT id, title, description, ingredient, category, prep_time_mins, status, user_id, created_at, image FROM recipes WHERE 1 = 1";
    const values: any[] = [];
    if (queryData) {
        const { ingredient, category } = queryData as RecipeFilter;
        if (category) {
            query += " AND category = ?";
            values.push(category);
        }
        if (ingredient) {
            query += " AND LOWER(ingredient) LIKE LOWER(?) ";
            values.push(ingredient);
        }
    }
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(query, values);
        return rows.map((row) => {
            const mime = row.image
                ? detectImageType(row.image) || "image/jpeg"
                : null;
            return {
                ...row,
                image: row.image
                    ? `data:${mime};base64,${row.image.toString("base64")}`
                    : null,
            };
        });
    } catch (err: any) {
        return err.message;
    }
}

export async function getRecipeById(pool: mysql.Pool, id: number) {
    const query =
        "SELECT id, title, description, category, prep_time_mins, status, user_id, created_at FROM recipes WHERE id = ? LIMIT 1;";
    try {
        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw error; // Rethrow to let the route handler catch it and send a 500 response
    }
}

export async function uploadRecipe(pool: mysql.Pool, data: RecipePayload) {
    const stmt = `INSERT INTO recipes
    (title, description, category, prep_time_mins, ingredient, image, status, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
        data.title,
        data.description ?? null,
        data.category ?? null,
        data.prep_time_mins ?? null,
        data.ingredient ?? null,
        data.image ?? null,
        data.status || "draft",
        data.user_id,
    ];
    try {
        const [result] = await pool.execute<ResultSetHeader>(stmt, values);
        return result.insertId;
    } catch (err: any) {
        console.log("Recipe values:", {
            title: data.title,
            description: data.description,
            category: data.category,
            prep_time_mins: data.prep_time_mins,
            ingredient: data.ingredient,
            hasImage: Boolean(data.image),
            status: data.status || "draft",
            user_id: data.user_id,
        });
        console.log(err);
        throw err;
    }
}
export async function updateRecipe(
    pool: any,
    recipeId: number,
    userId: number,
    payload: {
        title?: string;
        description?: string;
        category?: string;
        prep_time_mins?: string;
        ingredient?: string | string[];
        image?: Buffer | null;
    },
) {
    // Confirm that this recipe belongs to the logged-in user.
    const [existing]: any = await pool.query(
        `SELECT id FROM recipes WHERE id = ? AND user_id = ?`,
        [recipeId, userId],
    );

    if (existing.length === 0) {
        return false;
    }

    const ingredientValue = Array.isArray(payload.ingredient)
        ? JSON.stringify(payload.ingredient)
        : payload.ingredient;

    const sql = `
        UPDATE recipes
        SET
            title = ?,
            description = ?,
            category = ?,
            prep_time_mins = ?,
            ingredient = ?,
            image = COALESCE(?, image),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
    `;

    await pool.query(sql, [
        payload.title,
        payload.description,
        payload.category,
        payload.prep_time_mins,
        ingredientValue,
        payload.image ?? null,
        recipeId,
        userId,
    ]);

    return true;
}
export async function deleteRecipe(
    pool: mysql.Pool,
    id: number,
    userId: number,
) {
    const stmt = "DELETE FROM recipes WHERE id = ? AND user_id = ?";
    try {
        const [result] = await pool.execute<ResultSetHeader>(stmt, [
            id,
            userId,
        ]);
        return result.affectedRows > 0;
    } catch (err) {
        throw err;
    }
}
