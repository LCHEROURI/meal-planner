import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ArrowLeft, Clock, Users, ChefHat } from 'lucide-react';
import type { MealPlan, Recipe } from '../../schemas';

export function RecipeDetails() {
  const { planId, recipeId } = useParams();
  const { user } = useAuthStore();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !planId || !recipeId) return;

    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'mealPlans', planId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const plan = docSnap.data() as MealPlan;
          // Support both numeric index and string id
          let foundRecipe: Recipe | undefined;
          if (!isNaN(Number(recipeId))) {
            foundRecipe = plan.recipes[Number(recipeId)];
          } else {
            foundRecipe = plan.recipes.find(r => r.id === recipeId);
          }
          
          if (foundRecipe) {
            setRecipe(foundRecipe);
          } else {
            setError("Recipe not found in this plan.");
          }
        } else {
          setError("Meal plan not found.");
        }
      } catch (err) {
        setError("Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [user, planId, recipeId]);

  if (loading) return <LoadingSpinner />;
  if (error || !recipe) return <ErrorState message={error || "Unknown error"} />;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <Link to={`/app/plans/${planId}`} className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Plan
      </Link>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-text-primary">{recipe.name}</h1>
        <p className="text-lg text-text-secondary">{recipe.description}</p>
        
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="flex items-center rounded-full bg-surface px-4 py-2 text-sm shadow-sm">
            <Clock className="mr-2 h-4 w-4 text-primary" />
            <span className="font-semibold">{recipe.totalTimeMinutes} min</span>
            <span className="ml-1 text-text-secondary">({recipe.prepTimeMinutes} prep + {recipe.cookTimeMinutes} cook)</span>
          </div>
          <div className="flex items-center rounded-full bg-surface px-4 py-2 text-sm shadow-sm">
            <Users className="mr-2 h-4 w-4 text-primary" />
            <span className="font-semibold">{recipe.servings} servings</span>
          </div>
          <div className="flex items-center rounded-full bg-surface px-4 py-2 text-sm shadow-sm">
            <ChefHat className="mr-2 h-4 w-4 text-primary" />
            <span className="font-semibold capitalize">{recipe.difficulty}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-8">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-text-primary">Ingredients</h3>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-sm text-text-primary">
                    <span className="font-semibold">{ing.quantity} {ing.unit}</span> {ing.name}
                    {ing.preparationNote && <span className="text-text-secondary"> ({ing.preparationNote})</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-text-primary">Equipment</h3>
            <ul className="space-y-2">
              {recipe.equipment.map((eq, i) => (
                <li key={i} className="flex items-center text-sm text-text-secondary">
                  <span className="mr-2 text-primary">•</span>
                  {eq}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          {recipe.preparationSteps && recipe.preparationSteps.length > 0 && (
            <div>
              <h3 className="mb-4 text-2xl font-bold text-text-primary">Preparation</h3>
              <div className="space-y-4">
                {recipe.preparationSteps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {step.order}
                    </div>
                    <p className="pt-1 text-text-primary leading-relaxed">{step.instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-4 text-2xl font-bold text-text-primary">Cooking</h3>
            <div className="space-y-4">
              {recipe.cookingSteps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                    {step.order}
                  </div>
                  <p className="pt-1 text-text-primary leading-relaxed">{step.instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {(recipe.substitutions.length > 0 || recipe.leftoverInstructions) && (
            <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-6">
              <h4 className="mb-4 text-lg font-bold text-text-primary">Chef's Notes</h4>
              {recipe.substitutions.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-semibold text-text-primary">Substitutions:</h5>
                  <ul className="list-inside list-disc text-sm text-text-secondary">
                    {recipe.substitutions.map((sub, i) => <li key={i}>{sub}</li>)}
                  </ul>
                </div>
              )}
              {recipe.leftoverInstructions && (
                <div>
                  <h5 className="font-semibold text-text-primary">Leftovers:</h5>
                  <p className="text-sm text-text-secondary">{recipe.leftoverInstructions}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
