import { genkit } from 'genkit';
import { MealPlanGenerationInputSchema, MealPlanSchema, RecipeSchema, RegenerationRequestSchema } from '../schemas';
import { vertexAI } from '@genkit-ai/google-genai';
import { systemPrompt } from './prompts';

export const ai = genkit({
  plugins: [vertexAI({ location: 'us-central1' })],
});

export const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: MealPlanGenerationInputSchema,
    outputSchema: MealPlanSchema,
  },
  async (input) => {
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

    const { output } = await ai.generate({
      model: vertexAI.model('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: prompt,
      output: {
        schema: MealPlanSchema,
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
      modelName: 'gemini-2.5-flash',
      promptVersion: '1.0',
      generationTimestamp: new Date().toISOString(),
      generationDurationMs: 0,
      retryCount: 0,
      validationOutcome: 'success',
      userId: 'system',
      generationType: 'full_plan',
    };

    return output;
  }
);

export const regenerateRecipeFlow = ai.defineFlow(
  {
    name: 'regenerateRecipeFlow',
    inputSchema: RegenerationRequestSchema,
    outputSchema: RecipeSchema,
  },
  async (input) => {
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

    const { output } = await ai.generate({
      model: vertexAI.model('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: prompt,
      output: {
        schema: RecipeSchema,
      },
      config: {
        temperature: 0.5, 
      },
    });

    if (!output) {
      throw new Error("Failed to regenerate recipe from AI.");
    }

    return output;
  }
);
