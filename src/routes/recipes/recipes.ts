import { Router, type Response } from 'express';
import { pool } from '../../../utils/db.ts'
import { getRecipes, getRecipeById, uploadRecipe,  deleteRecipe, type RecipePayload } from "../../models/recipesModel.ts"
import { uploadSingleImage } from '../../middleware/upload.ts';
import { auth_middleware, type AuthRequest } from '../../middleware/auth.ts';

const recipesRoute : Router = Router();

recipesRoute.route("/")
.get(async (req, res) => {
    const [result] = await getRecipes(pool);
    console.log(result)
    res.json({...result});
})
.post(auth_middleware,uploadSingleImage, async (req, res) => {
    const imageBuffer = req.file ? req.file.buffer : null;
    const payload = {...req.body,
        image: imageBuffer
    } as RecipePayload;
    
    try{
        const result = await uploadRecipe(pool, payload);
        if (result) return res.status(201).json({message: "Recipe Uploaded Successfully!"})
    } catch(err: any) {
     return res.status(400).json({error: err.message})   
    }
})

recipesRoute.route("/:id")
.get(async (req, res)=>{
    const recipeId : number = Number(req.params.id);
    try {
        const recipe = await getRecipeById(pool, recipeId)
        if (!recipe) return res.status(404).json({error : `Recipe Not Found`})
        return res.status(200).json(recipe)
    } catch(err) {
        return res.status(500).json({ error: "Failed to fetch recipes" })
    }
})
.delete(auth_middleware, async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "UNAUTHORIZED",
                message: "Authentication required.",
            });
        }
        const userId = Number(req.user.user_id)
        const recipeId = Number(req.params.id);
        if (Number.isNaN(recipeId)) {
            return res.status(400).json({ error: "Invalid recipe ID" });
        }

        try {
            const deleted = await deleteRecipe(pool, recipeId, userId);
            if (!deleted) {
                return res
                    .status(404)
                    .json({ error: "Recipe not found or not owned by user" });
            }
            return res.status(200).json({ message: "Recipe deleted successfully" });
        } catch (err) {
            return res.status(500).json({ error: "Failed to delete recipe" });
        }
    });

export default recipesRoute;