import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm h-full flex flex-col items-center justify-center text-center">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-800">
            {this.props.fallbackTitle || 'Erreur d\'affichage'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
            {this.state.error?.message || 'Une erreur est survenue lors du rendu de ce composant.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
