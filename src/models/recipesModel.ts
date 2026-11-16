import mysql, {
    type ResultSetHeader,
    type RowDataPacket,
} from "mysql2/promise";
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

export async function getRecipes(pool: mysql.Pool) {
    const query = "id, title, description, category, prep_time_mins, status, user_id, created_at FROM recipe";
    try{
    const [recipes] = await pool.execute<RowDataPacket[]>(query);
    return recipes;
} catch (err:any) {
    return err.message;
}
}

export async function getRecipeById(pool: mysql.Pool, id: number) {
 const query = "title, description, category, prep_time_mins, status, user_id, created_at FROM recipe WHERE id = ?";
 try{
    const [rows] = await pool.execute<RowDataPacket[]>(query,[id])
    return rows.length > 0 ? rows[0] : null;
        
} catch (error) {
    throw error; // Rethrow to let the route handler catch it and send a 500 response
}
}
 
export async function uploadRecipe(pool: mysql.Pool , data : RecipePayload) {
    const stmt = `INSERT INTO recipes
    (title, description, category, prep_time_mins, ingredient, image, status, user_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
        data.title,
        data.description,
        data.category,
        data.prep_time_mins,
        data.ingredient,
        data.image,
        data.status || 'draft', 
        data.user_id
    ];
    try{
        const [ result ] = await pool.execute<ResultSetHeader>(stmt,[values]);
        return result.insertId;
    } catch (err: any) {
        throw err;
    }

}