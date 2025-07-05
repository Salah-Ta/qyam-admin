import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class WordCloudErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WordCloud Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center">
            <p className="text-red-500 text-xl mb-2">خطأ في تحميل سحابة المهارات</p>
            <p className="text-gray-500 text-sm">يرجى المحاولة مرة أخرى</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WordCloudErrorBoundary;
