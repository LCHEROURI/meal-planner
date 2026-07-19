import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootLayout } from './layouts/RootLayout';
import { AppLayout } from './layouts/AppLayout';
import { useAuthListener } from './hooks/useAuthListener';
import { LandingPage } from './pages/LandingPage';
import { LoginForm } from './features/auth/LoginForm';
import { SignupForm } from './features/auth/SignupForm';
import { OnboardingForm } from './features/onboarding/OnboardingForm';
import { NewPlanForm } from './features/meal-plans/NewPlanForm';
import { Dashboard } from './features/meal-plans/Dashboard';
import { PlanDetails } from './features/meal-plans/PlanDetails';
import { RecipeDetails } from './features/meal-plans/RecipeDetails';
import { ShoppingList } from './features/meal-plans/ShoppingList';
import { SharedPlan } from './features/meal-plans/SharedPlan';
import { useAuthStore } from './stores/authStore';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const NotFound = () => <div className="p-8 text-center text-error">404 - Not Found</div>;

const queryClient = new QueryClient();

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return <>{children}</>;
}

// Redirects authenticated users away from public auth pages
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <LoadingSpinner message="Checking authentication..." />;
  if (user) return <Navigate to="/app" replace />;
  return <div className="flex min-h-[80vh] items-center justify-center p-4">{children}</div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<LandingPage />} />
              
              <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupForm /></PublicRoute>} />
              <Route path="/share/:shareId" element={<SharedPlan />} />
              
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="onboarding" element={<div className="flex min-h-[60vh] items-center justify-center"><OnboardingForm /></div>} />
                <Route path="new-plan" element={<NewPlanForm />} />
                <Route path="plans" element={<Dashboard />} />
                <Route path="plans/:planId" element={<PlanDetails />} />
                <Route path="plans/:planId/recipes/:recipeId" element={<RecipeDetails />} />
                <Route path="plans/:planId/shopping-list" element={<ShoppingList />} />
                <Route path="settings" element={<div>Settings</div>} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
