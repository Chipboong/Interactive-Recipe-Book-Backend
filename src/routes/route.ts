import express, {
    type Request,
    type Response,
    type NextFunction,
} from "express";
import authRoute from "./auth/auth.ts";
import recipesRoute from "./recipes/recipes.ts";

const router = express.Router();
router.use("/auth", authRoute);
router.use("/recipes", recipesRoute)
export default router;
