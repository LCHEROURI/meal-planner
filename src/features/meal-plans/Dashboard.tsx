import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/common/Card';
import { Plus, Calendar, Clock } from 'lucide-react';
import type { MealPlan } from '../../schemas';

export function Dashboard() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<(MealPlan & { id: string, createdAt: any })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchPlans = async () => {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'mealPlans'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const fetchedPlans = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as (MealPlan & { id: string, createdAt: any })[];
        
        setPlans(fetchedPlans);
      } catch (err) {
        console.error('Failed to fetch plans', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-text-secondary">Loading your meal plans...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Your Meal Plans</h1>
        <Link to="/app/new-plan">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Plan
          </Button>
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-12 text-center shadow-sm">
          <Calendar className="mb-4 h-12 w-12 text-text-secondary opacity-50" />
          <h3 className="mb-2 text-xl font-bold text-text-primary">No meal plans yet</h3>
          <p className="mb-6 max-w-md text-text-secondary">Generate your first weeknight dinner plan tailored to your preferences.</p>
          <Link to="/app/new-plan">
            <Button>Create Your First Plan</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map(plan => (
            <Card key={plan.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{plan.name || 'Weeknight Meal Plan'}</CardTitle>
                <p className="text-sm text-text-secondary">
                  {plan.createdAt?.toDate().toLocaleDateString() || 'Recently created'}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2 text-sm text-text-secondary">
                  <span className="flex items-center rounded-full bg-background px-2 py-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    {plan.planLength} days
                  </span>
                  <span className="flex items-center rounded-full bg-background px-2 py-1">
                    <Clock className="mr-1 h-3 w-3" />
                    {plan.generationInput.maxTotalTimeMinutes} min/meal
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Link to={`/app/plans/${plan.id}`} className="w-full">
                  <Button variant="secondary" className="w-full">View Plan</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
