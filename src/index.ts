import dotenv from "dotenv";
import express, { type Express, type Request, type Response } from "express";
dotenv.config();

// Let ignore the undefined part.
const PORT: number = Number.parseInt(process.env.PORT as string);

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.listen(3000);
