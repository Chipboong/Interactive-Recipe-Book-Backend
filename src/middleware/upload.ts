import multer  from "multer"
import path from "node:path"
import type { RequestHandler } from "express"

// rules for the recipe image
export const MAX_IMG_BYTES = 2 * 1024 * 1024 //2MB
export const IMG_FIELD = "image"
const ALLOWED_MIME = new Set(["image/jpeg", "image/png"])
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png"])


export class UploadError extends Error {
    code: string
    status: number
    constructor(code: string, message: string, status = 400) {
        super(message)
        this.name ="UploadError"
        this.code = code
        this.status= status
    }
}

// magic bytes check
// here, its exported so the "serve image" route can reuse it to 
// to pick the Content-Type when reading the bytes from the db
const PNG_SIGNATURE = Buffer.from([ 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

export function detectImageType(buf: Buffer): "image/png" | "image/jpeg" | null {
    // PNG: 8-byte signature
    if (buf.length >= 8 && buf.subarray(0, 8).equals(PNG_SIGNATURE)) {
        return "image/png"
    }

    // JPEG starts with FF D8 FF
    if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
        return "image/jpeg"
    }
    return null
}

// Multer instance
const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMG_BYTES,
        files: 1,
        fields: 20, // cap the num of text fields
        fieldSize: 64 * 1024 
    },

    // first, just a cheap filter on what the client claims
    fileFilter(_req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase()
        if (ALLOWED_MIME.has(file.mimetype) && ALLOWED_EXT.has(ext)) {
            cb(null, true)
        } else {
            cb(
                new UploadError(
                    "INVALID_FILE_TYPE",
                    "Only JPEG or PNG images are allowed."
                ),
            )
        }
    }
})

// translate multer's own errors into our UploadError
// anything else unknown is passed on untouched and becomes a generic 500
function toUploadError(err: unknown): unknown{
    if (err instanceof UploadError) return err

    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return new UploadError(
                    "FILE_TOO_LARGE",
                    `Image must be ${MAX_IMG_BYTES / (1024 * 1024)} MB or smaller.`,
                    413 // content too large
                )
            case "LIMIT_UNEXPECTED_FILE": // wrong field name, or more than one file
            case "LIMIT_FILE_COUNT":
                return new UploadError(
                    "UNEXPECTED_FILE",
                    `Upload a single image in the "${IMG_FIELD}" field.`
                )
            default:
                return new UploadError("BAD_UPLOAD", "The upload could not be processed.")
        }
    }
    return err
}

// So, the order: auth -> uploadSingleImage -> validate body -> save to db
export const uploadSingleImage: RequestHandler = (req, res, next) => {
    uploader.single(IMG_FIELD)(req, res, (err: unknown) => {
        if (err) return next(toUploadError(err))

        const file = req.file;
        if (!file) return next() // since image is optional, nothing to check

        const detected = detectImageType(file.buffer);
        if (!detected) {
            return next(
                new UploadError(
                    "INVALID_IMAGE",
                    "The file is not a valid JPEG or PNG image."
                ),
            );
        }

        file.mimetype = detected
        next()  
    })
} 