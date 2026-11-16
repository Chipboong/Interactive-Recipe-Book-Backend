export interface recipeForm {
    title: string;
    preptime: string;
    description?: string | null;
    image: Buffer;
    ingredients: string[];
}