import * as admin from 'firebase-admin';
import { onCallGenkit } from 'firebase-functions/v2/https';
import { generateMealPlanFlow, regenerateRecipeFlow } from './ai/genkit';
import { setGlobalOptions } from "firebase-functions/v2";

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

// Export genkit flows as callable Cloud Functions
export const generateMealPlan = onCallGenkit({
  authPolicy: (auth) => {
    if (!auth?.uid) {
      throw new Error("User must be authenticated to generate a meal plan.");
    }
    return true;
  },
  cors: true,
  timeoutSeconds: 300, // Important for AI tasks
}, generateMealPlanFlow);

export const regenerateRecipe = onCallGenkit({
  authPolicy: (auth) => {
    if (!auth?.uid) {
      throw new Error("User must be authenticated to regenerate a recipe.");
    }
    return true;
  },
  cors: true,
  timeoutSeconds: 120,
}, regenerateRecipeFlow);
