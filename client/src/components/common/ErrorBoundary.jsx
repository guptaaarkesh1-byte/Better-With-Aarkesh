import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl border border-[#eadcd3] shadow-lg max-w-md w-full">
            <div className="w-12 h-12 rounded-full bg-[#fbf0eb] text-[#c9542f] flex items-center justify-center mx-auto mb-4 text-xl">
              ⚠️
            </div>
            <h2 className="font-serif text-xl font-bold text-[#111010] mb-2">
              Something went wrong
            </h2>
            <p className="text-xs text-[#7a756b] mb-4 leading-relaxed">
              We encountered an issue loading this page. Please reload or return home.
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-black/5 text-[#721c24] text-[11px] font-mono break-words mb-5 text-left">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-full bg-[#c9542f] hover:bg-[#b04523] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-full border border-black/15 text-[#111010] hover:bg-black/5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

