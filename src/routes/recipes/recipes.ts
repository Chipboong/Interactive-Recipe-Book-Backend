import { Router } from 'express';
import { pool } from '../../../utils/db.ts'
import { getRecipes, getRecipeById, uploadRecipe, type RecipePayload } from "../../models/recipesModel.ts"
import { uploadSingleImage } from '../../middleware/upload.ts';

const recipesRoute : Router = Router();

recipesRoute.route("/")
.get(async (req, res) => {
    const [result] = await getRecipes(pool);
    console.log(result)
    res.json({...result});
})
.post(uploadSingleImage, async (req, res) => {
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

export default recipesRoute;