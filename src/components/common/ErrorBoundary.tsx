import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
          <div className="max-w-2xl rounded-xl border border-error/20 bg-surface p-8 shadow-lg">
            <h1 className="mb-4 text-2xl font-bold text-error">Something went wrong.</h1>
            <p className="mb-4 text-text-secondary">The application crashed while trying to render this page.</p>
            <div className="overflow-auto rounded bg-error/10 p-4 text-left text-sm text-error">
              <p className="font-mono font-bold">{this.state.error && this.state.error.toString()}</p>
              <pre className="mt-2 text-xs">{this.state.errorInfo?.componentStack}</pre>
            </div>
            <button 
              className="mt-6 rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
              onClick={() => window.location.href = '/'}
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
