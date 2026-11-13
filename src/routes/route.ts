import express, {
    type Request,
    type Response,
    type NextFunction,
} from "express";
import authRoute from "./auth/auth.ts";

const router = express.Router();
router.use("/auth", authRoute);
export default router;
