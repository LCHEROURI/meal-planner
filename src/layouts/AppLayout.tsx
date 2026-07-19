import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { LogOut } from 'lucide-react';
import { auth } from '../lib/firebase/config';

export function AppLayout() {
  const { user, loading, onboardingCompleted } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (onboardingCompleted === false && location.pathname !== '/app/onboarding') {
    return <Navigate to="/app/onboarding" replace />;
  }

  if (onboardingCompleted === true && location.pathname === '/app/onboarding') {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface px-6 py-4 shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link to="/app" className="text-xl font-bold tracking-tight text-primary">
            MealPlanner Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-text-secondary">{user.email}</span>
            <button
              onClick={() => auth.signOut()}
              className="flex items-center text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <LogOut className="mr-1 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
