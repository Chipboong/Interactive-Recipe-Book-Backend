import dotenv from "dotenv";
import express, { type Express, type Request, type Response } from "express";
import router from "./routes"
dotenv.config();

// Let ignore the undefined part.
const PORT= process.env.PORT;
if (!PORT)
{
    throw new Error("Please set port in .env")
}
const app: Express = express();

app.use(router);

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.listen(Number.parseInt(PORT));
