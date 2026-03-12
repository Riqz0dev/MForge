import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado.";
      
      try {
        const parsedError = JSON.parse(this.state.error?.message || "");
        if (parsedError.error && parsedError.operationType) {
          errorMessage = `Erro no Firestore (${parsedError.operationType}): ${parsedError.error}`;
        }
      } catch {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-[#E4E3E0] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <h2 className="text-4xl font-black italic font-serif uppercase tracking-tighter text-red-600">Ops! Algo deu errado.</h2>
            <p className="font-mono text-sm opacity-70">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-[#141414] text-[#E4E3E0] font-bold uppercase tracking-widest text-xs"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
