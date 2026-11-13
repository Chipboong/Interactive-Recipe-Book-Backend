import dotenv from "dotenv";
import express, { type Express, type Request, type Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes/route.ts";
dotenv.config();
const PORT = process.env.PORT;
if (!PORT) {
    throw new Error("Please set port in .env");
}
const app: Express = express();
app.use(bodyParser.json());
app.use(cors());

// we will implement it using route.
// the api shall follow this structure
// /api/version/route e.g. /api/v1/login

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});
app.get("/health", (req: Request, res: Response) => {
    res.json({
        health: "ok",
    });
});
// This is not the best implementation
// suggest seperate version for future implement
app.use("/api/v1", router);
// apparently we can't use route "*" anymore in expressjs 5.
app.all("/{*any}", (req: Request, res: Response) => {
    res.status(404); // would be best to have default page for it.
});
app.listen(Number.parseInt(PORT), () => {
    console.log(`Server start on port: ${PORT}`)
});
