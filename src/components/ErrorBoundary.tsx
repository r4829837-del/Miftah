import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error in ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      // Persist a brief error summary for diagnostics
      try {
        const summary = {
          message: this.state.error?.message || 'Unknown error',
          time: new Date().toISOString(),
          path: typeof window !== 'undefined' ? window.location.pathname : '',
        };
        localStorage.setItem('last_error_summary', JSON.stringify(summary));
      } catch (error) {
        console.warn('Failed to save error summary:', error);
      }

      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded max-w-2xl mx-auto" dir="rtl">
            <h2 className="font-bold mb-2">حدث خطأ أثناء عرض الصفحة</h2>
            <p className="text-sm mb-3">يرجى إعادة تحميل الصفحة أو الرجوع لاحقاً.</p>

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => (window.location.reload())}
                className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700"
              >
                إعادة التحميل
              </button>
              <button
                onClick={() => (window.history && window.history.back && window.history.back())}
                className="px-3 py-1.5 rounded bg-gray-200 text-red-800 text-sm hover:bg-gray-300"
              >
                رجوع
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error?.message ? (
              <details className="mt-2 text-xs text-red-900 whitespace-pre-wrap" open>
                <summary className="cursor-pointer mb-1">تفاصيل الخطأ (للاختبار)</summary>
                {this.state.error.message}
              </details>
            ) : null}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

