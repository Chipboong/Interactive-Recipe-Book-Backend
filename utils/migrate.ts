import { close_pool, pool } from "./db.ts";
import { UP_DB } from "./sql.ts";

for (let statement of UP_DB) {
    console.log(`Executing: ${statement}`);
    await pool.execute(statement);
}
console.log("FINISHED YAY")
await close_pool(pool)