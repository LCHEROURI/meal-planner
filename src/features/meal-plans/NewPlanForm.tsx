import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase/config';
import { MealPlanGenerationInputSchema, type MealPlanGenerationInput, type MealPlan } from '../../schemas';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { VoiceConcierge } from '../voice/VoiceConcierge';
import { VoiceInputButton } from '../voice/VoiceInputButton';
import { Clock3, CookingPot, Sparkles, UsersRound } from 'lucide-react';

export function NewPlanForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { register, handleSubmit, formState: { errors }, getValues, setValue } = useForm<MealPlanGenerationInput>({
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

  const appendDictation = (field: 'useSoonIngredients' | 'excludedIngredients' | 'freeTextNotes', spokenText: string) => {
    if (field === 'freeTextNotes') {
      const current = getValues(field) || '';
      setValue(field, current ? `${current} ${spokenText}` : spokenText, { shouldDirty: true });
      return;
    }
    const current = getValues(field) || [];
    const additions = spokenText.split(/,|\band\b/gi).map((item) => item.trim()).filter(Boolean);
    setValue(field, [...current, ...additions], { shouldDirty: true });
  };

  const applyVoicePreferences = (preferences: Partial<MealPlanGenerationInput>, transcript: string) => {
    if (preferences.planLength) setValue('planLength', preferences.planLength, { shouldDirty: true });
    if (preferences.servings) setValue('servings', preferences.servings, { shouldDirty: true });
    if (preferences.maxTotalTimeMinutes) setValue('maxTotalTimeMinutes', preferences.maxTotalTimeMinutes, { shouldDirty: true });
    if (preferences.dietaryPattern) setValue('dietaryPattern', preferences.dietaryPattern, { shouldDirty: true });
    if (preferences.useSoonIngredients) setValue('useSoonIngredients', preferences.useSoonIngredients, { shouldDirty: true });
    if (preferences.excludedIngredients) setValue('excludedIngredients', preferences.excludedIngredients, { shouldDirty: true });
    setValue('freeTextNotes', transcript, { shouldDirty: true });
  };

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
    <div className="mx-auto w-full max-w-4xl pb-10">
      <div className="mb-7 max-w-2xl">
        <p className="section-kicker">Your kitchen, your rhythm</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-text-primary sm:text-5xl">Create your meal plan</h1>
        <p className="mt-3 text-base leading-7 text-text-secondary sm:text-lg">Tell us what your week looks like, then make it yours.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <VoiceConcierge onPreferences={applyVoicePreferences} />

      <form onSubmit={handleSubmit(onSubmit)} className="form-surface mt-6 space-y-7">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label"><CookingPot aria-hidden="true" /> Plan length</label>
            <select {...register('planLength')} className="input input-tall">
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
            </select>
          </div>
          
          <div>
            <label className="field-label"><UsersRound aria-hidden="true" /> Servings</label>
            <input type="number" {...register('servings', { valueAsNumber: true })} className="input input-tall" />
            {errors.servings?.message && <p className="mt-1 text-sm text-error">{errors.servings.message}</p>}
          </div>

          <div>
            <label className="field-label"><Clock3 aria-hidden="true" /> Max time</label>
            <input type="number" {...register('maxTotalTimeMinutes', { valueAsNumber: true })} className="input input-tall" />
            {errors.maxTotalTimeMinutes?.message && <p className="mt-1 text-sm text-error">{errors.maxTotalTimeMinutes.message}</p>}
          </div>

          <div>
            <label className="field-label"><Sparkles aria-hidden="true" /> Dietary pattern</label>
            <select {...register('dietaryPattern')} className="input input-tall">
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

        <div className="space-y-4 border-t border-border pt-6">
          <div>
            <label className="field-label">Ingredients to use soon</label>
            <div className="relative">
              <input
                {...register('useSoonIngredients', {
                setValueAs: (v) => typeof v === 'string' ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : (v || [])
              })}
                className="input input-tall pr-14"
                placeholder="e.g. spinach, chicken, bell peppers"
              />
              <VoiceInputButton label="Speak ingredients to use soon" onTranscript={(text) => appendDictation('useSoonIngredients', text)} className="absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="field-label">Avoid</label>
            <div className="relative">
              <input
                {...register('excludedIngredients', {
                setValueAs: (v) => typeof v === 'string' ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : (v || [])
              })}
                className="input input-tall pr-14"
                placeholder="e.g. mushrooms, cilantro"
              />
              <VoiceInputButton label="Speak ingredients to avoid" onTranscript={(text) => appendDictation('excludedIngredients', text)} className="absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="field-label">Notes, cravings, or kitchen context</label>
            <div className="relative">
              <textarea
                {...register('freeTextNotes')}
                className="input min-h-28 py-3 pr-14"
                placeholder="e.g. I want something spicy on Tuesday, or an easy pasta night."
              />
              <VoiceInputButton label="Speak additional notes" onTranscript={(text) => appendDictation('freeTextNotes', text)} className="absolute right-2 top-3" />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-accent text-base shadow-[0_14px_28px_rgba(255,92,78,0.26)] hover:bg-[#e84f44]" size="lg">
          <Sparkles className="mr-2 h-5 w-5" /> Generate my plan
        </Button>
        <p className="text-center text-sm font-medium text-text-secondary">You can always edit before generating.</p>
      </form>
    </div>
  );
}
