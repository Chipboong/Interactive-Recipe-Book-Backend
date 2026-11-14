import express, {type Request, type Response} from "express"
import { uploadSingleImage } from "../../middleware/upload.ts"

// GUYS, THIS ONE IS FOR TESTING ONLY
// WILL REMOVE IT LATER 

const recipesRoute = express.Router()

recipesRoute.post(
    "/test-upload",
    uploadSingleImage,
    (req: Request, res: Response) => {
        // the image is optional, so "no file" is a valid request.
        if (!req.file) {
            return res.json({
                success: true,
                message: "No image sent (allowed, image is optional).",
                fields: req.body,
            })
        }

        // we only report details; nothing is saved anywhere.
        return res.json({
            success: true,
            message: "Image accepted.",
            originalName: req.file.originalname,
            verifiedType: req.file.mimetype,
            bytes: req.file.size,
            fields: req.body
        })
    }
)

export default recipesRoute;