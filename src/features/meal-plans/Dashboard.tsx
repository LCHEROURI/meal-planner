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
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Your dinner rhythm</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-text-primary">Your meal plans</h1>
        </div>
        <Link to="/app/new-plan">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create plan
          </Button>
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="empty-plan-state">
          <div className="empty-plan-icon"><Calendar aria-hidden="true" /></div>
          <h3 className="mb-2 text-2xl font-black text-text-primary">Make your first plan</h3>
          <p className="mb-6 max-w-md text-text-secondary">Speak your week or type the details. We’ll turn your kitchen, schedule, and preferences into practical dinners.</p>
          <Link to="/app/new-plan">
            <Button>Create Your First Plan</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map(plan => (
            <Card key={plan.id} className="flex flex-col border-white/80 bg-white/90 transition-all hover:-translate-y-1 hover:shadow-xl">
              <CardHeader>
                <CardTitle>{plan.name || 'Weeknight Meal Plan'}</CardTitle>
                <p className="text-sm text-text-secondary">
                  {plan.createdAt?.toDate().toLocaleDateString() || 'Recently created'}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2 text-sm text-text-secondary">
                  <span className="flex items-center rounded-full bg-sky-100 px-2 py-1 text-sky-800">
                    <Calendar className="mr-1 h-3 w-3" />
                    {plan.planLength} days
                  </span>
                  <span className="flex items-center rounded-full bg-violet-100 px-2 py-1 text-violet-800">
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
