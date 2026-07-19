import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/common/Button';
import { Clock, Users, ChefHat } from 'lucide-react';
import type { MealPlan } from '../../schemas';

export function SharedPlan() {
  const { shareId } = useParams();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) return;

    const fetchSharedPlan = async () => {
      try {
        const docRef = doc(db, 'sharedPlans', shareId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPlan({ id: docSnap.id, ...docSnap.data() } as MealPlan);
        } else {
          setError("Shared meal plan not found or has been revoked.");
        }
      } catch (err) {
        setError("Failed to load shared meal plan.");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPlan();
  }, [shareId]);

  if (loading) return <LoadingSpinner />;
  if (error || !plan) return <ErrorState message={error || "Unknown error"} />;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
      <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        <h1 className="mb-2 text-3xl font-bold text-text-primary">{plan.name || 'Weeknight Meal Plan'}</h1>
        <p className="mb-6 text-text-secondary">
          Shared by a friend • {plan.planLength} days • {plan.servings} servings
        </p>
        
        <Link to="/signup">
          <Button>Create Your Own Plan</Button>
        </Link>
      </div>

      <div className="space-y-12">
        {plan.recipes.map((recipe, index) => (
          <div key={recipe.id || index} className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-2xl font-bold text-text-primary">
                <span className="mr-2 text-text-secondary">Day {index + 1}:</span>
                {recipe.name}
              </h2>
            </div>
            
            <p className="text-lg text-text-secondary">{recipe.description}</p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center rounded-full bg-background px-4 py-2 text-sm">
                <Clock className="mr-2 h-4 w-4 text-primary" />
                <span className="font-semibold">{recipe.totalTimeMinutes} min</span>
              </div>
              <div className="flex items-center rounded-full bg-background px-4 py-2 text-sm">
                <Users className="mr-2 h-4 w-4 text-primary" />
                <span className="font-semibold">{recipe.servings} servings</span>
              </div>
              <div className="flex items-center rounded-full bg-background px-4 py-2 text-sm">
                <ChefHat className="mr-2 h-4 w-4 text-primary" />
                <span className="font-semibold capitalize">{recipe.difficulty}</span>
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
              </div>

              <div className="md:col-span-2 space-y-8">
                {recipe.preparationSteps && recipe.preparationSteps.length > 0 && (
                  <div>
                    <h3 className="mb-4 text-xl font-bold text-text-primary">Preparation</h3>
                    <div className="space-y-4">
                      {recipe.preparationSteps.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                            {step.order}
                          </div>
                          <p className="pt-1 text-text-primary">{step.instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-4 text-xl font-bold text-text-primary">Cooking</h3>
                  <div className="space-y-4">
                    {recipe.cookingSteps.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                          {step.order}
                        </div>
                        <p className="pt-1 text-text-primary">{step.instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
