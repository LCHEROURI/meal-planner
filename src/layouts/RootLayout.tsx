import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-primary">MealPlanner</div>
          <nav>
            {/* Nav links will go here */}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-surface py-8 text-center text-sm text-text-secondary">
        <p>© {new Date().getFullYear()} AI Meal Planner. All rights reserved.</p>
      </footer>
    </div>
  );
}
