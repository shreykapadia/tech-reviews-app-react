import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null, retryCount: 0 };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });

        // Auto-retry once for transient HMR/module errors (e.g., useContext null)
        if (this.state.retryCount === 0 && this.isTransientError(error)) {
            console.log('[ErrorBoundary] Detected transient error, auto-retrying...');
            setTimeout(() => {
                this.setState(prev => ({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                    retryCount: prev.retryCount + 1,
                }));
            }, 100);
        }
    }

    isTransientError(error) {
        // Known transient errors from HMR / module hot reload
        const msg = error?.message || '';
        return (
            msg.includes("Cannot read properties of null (reading 'useContext')") ||
            msg.includes("Cannot read properties of null (reading 'useState')") ||
            msg.includes("Cannot read properties of null (reading 'useRef')") ||
            msg.includes("Cannot read properties of null (reading 'useEffect')")
        );
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null, retryCount: 0 });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8 text-center">
                        <div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-slate-100">
                                Something went wrong.
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
                                {this.state.error && this.state.error.toString()}
                            </p>
                            {this.state.errorInfo && (
                                <details className="mt-2 text-left text-xs text-gray-500 dark:text-slate-500 whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </details>
                            )}
                        </div>
                        <div className="mt-5 space-y-3">
                            <button
                                onClick={this.handleRetry}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
