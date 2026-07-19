import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useNavigate } from 'react-router-dom';

const onboardingSchema = z.object({
  householdSize: z.number().int().positive().default(2),
  defaultPlanLength: z.enum(['3', '5', '7']).default('5'),
  maxTotalTimeMinutes: z.number().int().positive().default(45),
  dietaryPattern: z.enum(['no_restriction', 'vegetarian', 'vegan', 'pescatarian', 'gluten_free', 'dairy_free', 'lower_carb', 'halal_friendly', 'kosher_style']).default('no_restriction'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      householdSize: 2,
      defaultPlanLength: '5',
      maxTotalTimeMinutes: 45,
      dietaryPattern: 'no_restriction',
    }
  });

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;
    
    try {
      setError(null);
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      });
      navigate('/app');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-border bg-surface p-8 shadow-sm">
      <h2 className="mb-2 text-2xl font-bold text-text-primary">Welcome to MealPlanner</h2>
      <p className="mb-6 text-text-secondary">Let's set up your default preferences to get you started.</p>

      {error && (
        <div className="mb-4 rounded-md bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Household Size"
            type="number"
            {...register('householdSize', { valueAsNumber: true })}
            error={errors.householdSize?.message}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Default Plan Length</label>
            <select
              {...register('defaultPlanLength')}
              className="input"
            >
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
            </select>
          </div>

          <Input
            label="Max Total Cooking Time (minutes)"
            type="number"
            {...register('maxTotalTimeMinutes', { valueAsNumber: true })}
            error={errors.maxTotalTimeMinutes?.message}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">Dietary Pattern</label>
            <select
              {...register('dietaryPattern')}
              className="input"
            >
              <option value="no_restriction">No specific restriction</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="gluten_free">Gluten-free</option>
              <option value="dairy_free">Dairy-free</option>
              <option value="lower_carb">Lower carbohydrate</option>
              <option value="halal_friendly">Halal-friendly</option>
              <option value="kosher_style">Kosher-style</option>
            </select>
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Complete Setup
        </Button>
      </form>
    </div>
  );
}
