import { Outlet, Navigate, Link, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CalendarDays, Home, LogOut, PlusCircle } from 'lucide-react';
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
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link to="/app" className="brand-mark"><span className="brand-mark-icon">✦</span> Meal<span>Planner</span></Link>
        <nav className="app-nav" aria-label="Main navigation">
          <NavLink end to="/app" className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`}><Home aria-hidden="true" /> Home</NavLink>
          <NavLink to="/app/new-plan" className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`}><PlusCircle aria-hidden="true" /> Create plan</NavLink>
          <NavLink to="/app/plans" className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link-active' : ''}`}><CalendarDays aria-hidden="true" /> My plans</NavLink>
        </nav>
        <div className="mt-auto hidden lg:block">
          <p className="mb-3 truncate text-xs font-semibold text-text-secondary">{user.email}</p>
          <button onClick={() => auth.signOut()} className="app-nav-link w-full"><LogOut aria-hidden="true" /> Sign out</button>
        </div>
      </aside>
      <main className="app-main"><Outlet /></main>
    </div>
  );
}
