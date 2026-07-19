"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateRecipeFlow = exports.generateMealPlanFlow = exports.ai = void 0;
const genkit_1 = require("genkit");
const schemas_1 = require("../schemas");
const google_genai_1 = require("@genkit-ai/google-genai");
const prompts_1 = require("./prompts");
exports.ai = (0, genkit_1.genkit)({
    plugins: [(0, google_genai_1.vertexAI)({ location: 'us-central1' })],
});
exports.generateMealPlanFlow = exports.ai.defineFlow({
    name: 'generateMealPlanFlow',
    inputSchema: schemas_1.MealPlanGenerationInputSchema,
    outputSchema: schemas_1.MealPlanSchema,
}, async (input) => {
    const prompt = `
      You need to generate a ${input.planLength}-day meal plan for ${input.servings} people.
      Max total time per meal: ${input.maxTotalTimeMinutes} minutes.
      Dietary pattern: ${input.dietaryPattern}.
      Allergens to avoid: ${input.allergens.join(', ') || 'None'}.
      Excluded ingredients: ${input.excludedIngredients.join(', ') || 'None'}.
      Preferred cuisines: ${input.preferredCuisines.join(', ') || 'Any'}.
      Disliked cuisines: ${input.dislikedCuisines.join(', ') || 'None'}.
      Pantry ingredients available: ${input.pantryIngredients.join(', ') || 'Assume standard basic pantry (salt, pepper, oil)'}.
      Ingredients to use soon: ${input.useSoonIngredients.join(', ') || 'None'}.
      Leftover preference: ${input.leftoverPreference ? 'Yes, make meals that have good leftovers' : 'No leftovers preferred'}.
      
      Additional Notes: ${input.freeTextNotes || 'None'}.
      
      Provide a highly realistic, delicious, and easy-to-follow meal plan that adheres strictly to these constraints.
    `;
    const { output } = await exports.ai.generate({
        model: google_genai_1.vertexAI.model('gemini-1.5-flash-001'),
        system: prompts_1.systemPrompt,
        prompt: prompt,
        output: {
            schema: schemas_1.MealPlanSchema,
        },
        config: {
            temperature: 0.4,
        },
    });
    if (!output) {
        throw new Error("Failed to generate meal plan from AI.");
    }
    output.status = 'ready';
    output.generationInput = input;
    output.metadata = {
        modelName: 'gemini-1.5-flash',
        promptVersion: '1.0',
        generationTimestamp: new Date().toISOString(),
        generationDurationMs: 0,
        retryCount: 0,
        validationOutcome: 'success',
        userId: 'system',
        generationType: 'full_plan',
    };
    return output;
});
exports.regenerateRecipeFlow = exports.ai.defineFlow({
    name: 'regenerateRecipeFlow',
    inputSchema: schemas_1.RegenerationRequestSchema,
    outputSchema: schemas_1.RecipeSchema,
}, async (input) => {
    const prompt = `
      The user wants to regenerate one specific recipe from their meal plan.
      
      The current meal plan has these constraints:
      Max total time per meal: ${input.currentPlanState.generationInput.maxTotalTimeMinutes} minutes.
      Dietary pattern: ${input.currentPlanState.generationInput.dietaryPattern}.
      Allergens to avoid: ${input.currentPlanState.generationInput.allergens.join(', ') || 'None'}.
      
      The user's specific request for regeneration:
      Reason: ${input.reason || 'None provided'}
      Modifier: ${input.modifier || 'None'}
      ${input.modifier === 'avoid_ingredient' ? `Ingredient to avoid: ${input.avoidIngredient}` : ''}
      
      Generate a single new recipe that fits into the existing plan, replacing the old one, and perfectly fulfilling the user's regeneration request.
      Do not repeat any other recipes in the current plan.
    `;
    const { output } = await exports.ai.generate({
        model: google_genai_1.vertexAI.model('gemini-1.5-flash-001'),
        system: prompts_1.systemPrompt,
        prompt: prompt,
        output: {
            schema: schemas_1.RecipeSchema,
        },
        config: {
            temperature: 0.5,
        },
    });
    if (!output) {
        throw new Error("Failed to regenerate recipe from AI.");
    }
    return output;
});
//# sourceMappingURL=genkit.js.map