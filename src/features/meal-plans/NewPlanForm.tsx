import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase/config';
import { MealPlanGenerationInputSchema, type MealPlanGenerationInput, type MealPlan } from '../../schemas';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function NewPlanForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<MealPlanGenerationInput>({
    resolver: zodResolver(MealPlanGenerationInputSchema) as any,
    defaultValues: {
      planLength: '5',
      servings: 2,
      maxTotalTimeMinutes: 45,
      dietaryPattern: 'no_restriction',
      allergens: [],
      excludedIngredients: [],
      preferredCuisines: [],
      dislikedCuisines: [],
      preferredProteins: [],
      pantryIngredients: [],
      useSoonIngredients: [],
      availableEquipment: [],
      skillLevel: 'intermediate',
      budgetPreference: 'medium',
      leftoverPreference: true,
      freeTextNotes: '',
    }
  });

  const onSubmit = async (data: MealPlanGenerationInput) => {
    if (!user) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generateMealPlan = httpsCallable<MealPlanGenerationInput, MealPlan>(functions, 'generateMealPlan');
      const result = await generateMealPlan(data);
      
      const planData = result.data;
      
      // Save to Firestore
      const plansRef = collection(db, 'users', user.uid, 'mealPlans');
      const docRef = await addDoc(plansRef, {
        ...planData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      navigate(`/app/plans/${docRef.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate meal plan. Please try again.');
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <LoadingSpinner message="Our AI is crafting your perfect weeknight meal plan. This may take 20-30 seconds..." />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border border-border bg-surface p-8 shadow-sm">
      <h2 className="mb-2 text-2xl font-bold text-text-primary">Create a New Meal Plan</h2>
      <p className="mb-6 text-text-secondary">Tell us what you need this week, and we'll generate a realistic, easy-to-cook plan.</p>

      {error && (
        <div className="mb-4 rounded-md bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Plan Length</label>
            <select {...register('planLength')} className="input">
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
            </select>
          </div>
          
          <Input
            label="Servings per meal"
            type="number"
            {...register('servings', { valueAsNumber: true })}
            error={errors.servings?.message}
          />

          <Input
            label="Max Time (minutes)"
            type="number"
            {...register('maxTotalTimeMinutes', { valueAsNumber: true })}
            error={errors.maxTotalTimeMinutes?.message}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Dietary Pattern</label>
            <select {...register('dietaryPattern')} className="input">
              <option value="no_restriction">No specific restriction</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="gluten_free">Gluten-free</option>
              <option value="dairy_free">Dairy-free</option>
              <option value="lower_carb">Lower carbohydrate</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Ingredients to use soon (comma separated)</label>
            <Input 
              {...register('useSoonIngredients', {
                setValueAs: (v) => typeof v === 'string' ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : (v || [])
              })}
              placeholder="e.g. spinach, ground beef, bell peppers"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Excluded ingredients (comma separated)</label>
            <Input 
              {...register('excludedIngredients', {
                setValueAs: (v) => typeof v === 'string' ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : (v || [])
              })}
              placeholder="e.g. mushrooms, cilantro"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Additional notes or cravings</label>
            <textarea 
              {...register('freeTextNotes')}
              className="input min-h-[100px] py-3"
              placeholder="e.g. I want something spicy on Tuesday, or I'd love a good pasta dish this week."
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Generate Meal Plan
        </Button>
      </form>
    </div>
  );
}
