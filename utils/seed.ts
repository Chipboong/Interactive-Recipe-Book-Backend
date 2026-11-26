import mysql from "mysql2/promise";
import argon2 from "argon2";
import { readFile } from "fs/promises";
import path from "path";
import "dotenv/config";

const db = mysql.createPool(process.env.DB_URI!);

const demoUser = {
    username: "test",
    email: "test@example.com",
    password: "Te#a1t3xjL",
};

const imagePaths = {
    img1: path.join(process.cwd(), "assets/recipes/id-1.jpg"),
    img2: path.join(process.cwd(), "assets/recipes/id-2.webp"),
    img3: path.join(process.cwd(), "assets/recipes/id-3.jpg"),
    img4: path.join(process.cwd(), "assets/recipes/id-4.jpg"),
    img5: path.join(process.cwd(), "assets/recipes/id-5.png"),
    img6: path.join(process.cwd(), "assets/recipes/id-6.jpg"),
    img7: path.join(process.cwd(), "assets/recipes/id-7.jpg"),
};

// Load images as binary buffers
async function loadImages() {
    return {
        img1: await readFile(imagePaths.img1),
        img2: await readFile(imagePaths.img2),
        img3: await readFile(imagePaths.img3),
        img4: await readFile(imagePaths.img4),
        img5: await readFile(imagePaths.img5),
        img6: await readFile(imagePaths.img6),
        img7: await readFile(imagePaths.img7),
    };
}

const seedRecipes = [
    {
        title: "Sushi",
        description:
            "A traditional Japanese dish made with vinegared short-grain rice and various ingredients.",
        category: "Main Dishes",
        ingredient: ["rice", "salmon", "seafood"],
        prepTime: "60 min",
        image: "img1",
    },
    {
        title: "Pho",
        description:
            "A well-loved Vietnamese noodle soup featuring aromatic broth, rice noodles, and tender beef.",
        category: "Breakfast",
        ingredient: ["noodles", "broth base", "beef"],
        prepTime: "20 min",
        image: "img2",
    },
    {
        title: "Ramen",
        description:
            "Iconic Japanese comfort food with rich, savory broth, wheat noodles, and tender toppings.",
        category: "Snack",
        ingredient: [
            "ramen noodles",
            "pork belly",
            "broth base",
            "soft-boiled egg",
        ],
        prepTime: "25 min",
        image: "img3",
    },
    {
        title: "Chocolate Fondant",
        description:
            "A rich French dessert featuring a decadent chocolate cake with a warm, molten liquid center.",
        category: "Dessert",
        ingredient: ["dark chocolate", "butter", "eggs", "flour"],
        prepTime: "15 min",
        image: "img4",
    },
    {
        title: "Steak",
        description:
            "A juicy grilled steak seasoned with herbs and spices, served with vegetables or sides.",
        category: "Main Dishes",
        ingredient: ["beef", "salt", "pepper", "butter"],
        prepTime: "30 min",
        image: "img5",
    },
    {
        title: "Chicken Roast",
        description:
            "Tender roasted chicken marinated with herbs and spices, cooked until golden and flavorful.",
        category: "Main Dishes",
        ingredient: ["chicken", "herbs", "garlic", "olive oil"],
        prepTime: "90 min",
        image: "img6",
    },
    {
        title: "Pancakes",
        description:
            "Fluffy homemade pancakes served with fresh fruits and maple syrup.",
        category: "Breakfast",
        ingredient: ["flour", "milk", "eggs", "sugar", "butter"],
        prepTime: "20 min",
        image: "img7",
    },
    // {
    //     title: "Caesar Salad",
    //     description:
    //         "A refreshing salad made with crisp lettuce, crunchy croutons, parmesan cheese, and creamy dressing.",
    //     category: "Salad",
    //     ingredient: ["lettuce", "croutons", "parmesan", "caesar dressing"],
    //     prepTime: "15 min",
    //     image: "img4",
    // },
    // {
    //     title: "Grilled Salmon",
    //     description:
    //         "Fresh salmon fillet grilled with lemon, garlic, and herbs for a flavorful and healthy meal.",
    //     category: "Main Dishes",
    //     ingredient: ["salmon", "lemon", "garlic", "olive oil", "herbs"],
    //     prepTime: "25 min",
    //     image: "img1",
    // },
    // {
    //     title: "Chocolate Brownies",
    //     description:
    //         "Rich and fudgy chocolate brownies with a soft center and a delicious chocolate flavor.",
    //     category: "Dessert",
    //     ingredient: ["dark chocolate", "butter", "flour", "sugar", "eggs"],
    //     prepTime: "35 min",
    //     image: "img2",
    // },
];

async function seed() {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Create demo user if it does not already exist
        const [existingUsers]: any = await connection.execute(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [demoUser.email],
        );

        let userId: number;

        if (existingUsers.length > 0) {
            userId = existingUsers[0].id;
            console.log("Demo user already exists:", demoUser.email);
        } else {
            const hashedPassword = await argon2.hash(demoUser.password);

            const [userResult]: any = await connection.execute(
                `INSERT INTO users (username, email, password)
         VALUES (?, ?, ?)`,
                [demoUser.username, demoUser.email, hashedPassword],
            );

            userId = userResult.insertId;
            console.log("Demo user created successfully!");
        }

        // 2. Load recipe images
        const images = await loadImages();

        console.log("Recipe images loaded successfully!");

        // 3. Insert recipes
        for (const recipe of seedRecipes) {
            // Avoid inserting duplicate recipes when running the seed again
            const [existingRecipes]: any = await connection.execute(
                `SELECT id FROM recipes
         WHERE title = ? AND user_id = ?
         LIMIT 1`,
                [recipe.title, userId],
            );

            if (existingRecipes.length > 0) {
                console.log(`Recipe already exists: ${recipe.title}`);
                continue;
            }

            const imageBuffer = images[recipe.image as keyof typeof images];

            await connection.execute(
                `INSERT INTO recipes (
          title,
          description,
          category,
          prep_time_mins,
          ingredient,
          image,
          status,
          user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    recipe.title,
                    recipe.description,
                    recipe.category,
                    recipe.prepTime,
                    JSON.stringify(recipe.ingredient),
                    imageBuffer,
                    "published",
                    userId,
                ],
            );

            console.log(`Recipe inserted: ${recipe.title}`);
        }

        await connection.commit();
        console.log("Database seeding completed!");
        console.log(`Demo account: ${demoUser.email}`);
        console.log(`Total seed recipes: ${seedRecipes.length}`);
    } catch (error) {
        await connection.rollback();
        console.error("Database seeding failed:", error);
        throw error;
    } finally {
        connection.release();
        await db.end();
    }
}

seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
