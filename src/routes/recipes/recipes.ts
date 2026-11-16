import { Router } from 'express';
import { pool } from '../../../utils/db.ts'
import { getRecipe } from "../../../utils/sql_helper.ts"
import type { recipeForm } from "./type.ts"

const recipesRoute : Router = Router();

recipesRoute.route("/")
.get(async (req, res) => {
    const [result] = await getRecipe(pool);
    res.json({result});
})
.post((req, res) => {
    const payload = req.body as recipesForm;
})

export default recipesRoute;