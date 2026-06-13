import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message || 'Something went wrong.' };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
          <div className="max-w-md rounded-3xl border border-rose-900/50 bg-gray-900 p-6 text-center shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-rose-300">Something went wrong</p>
            <h2 className="mt-3 text-xl font-bold text-white">The dashboard could not load.</h2>
            <p className="mt-2 text-sm text-gray-300">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-300"
            >
              Reload page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
