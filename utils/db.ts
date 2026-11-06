import mysql from "mysql2/promise";
const DB_URI = process.env.DB_URI;
if (!DB_URI) {
    throw new Error("DB_URI environment variable is not defined, check .env");
}
export const pool: mysql.Pool = mysql.createPool({
    uri: DB_URI,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
export async function close_pool(pool: mysql.Pool) {
    await pool.end();
}
