import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React component errors
 * Prevents the entire app from crashing when a component throws an error
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Auto-reload on chunk load failures (stale deployment cache)
    if (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Loading CSS chunk')
    ) {
      const lastReload = sessionStorage.getItem('chunk-error-reload');
      const now = Date.now();
      // Only auto-reload once per 30 seconds to prevent reload loops
      if (!lastReload || now - parseInt(lastReload, 10) > 30000) {
        sessionStorage.setItem('chunk-error-reload', String(now));
        window.location.reload();
        return;
      }
    }

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-error" />
                </div>
                <div className="flex-1">
                  <h1 className="headline-medium text-on-surface mb-2">
                    Something went wrong
                  </h1>
                  <p className="body-medium text-on-surface-variant mb-4">
                    An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                  </p>
                  {this.state.error && (
                    <details className="mb-4">
                      <summary className="body-small text-on-surface-variant cursor-pointer mb-2">
                        Error details
                      </summary>
                      <div className="bg-error-container/10 border border-error/20 rounded-lg p-3">
                        <p className="body-small text-error font-mono break-all">
                          {this.state.error.toString()}
                        </p>
                        {this.state.errorInfo && (
                          <pre className="body-small text-on-surface-variant mt-2 overflow-auto max-h-48 text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        )}
                      </div>
                    </details>
                  )}
                  <div className="flex gap-3">
                    <Button onClick={this.handleReset} variant="default">
                      Try again
                    </Button>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline"
                    >
                      Reload page
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}


