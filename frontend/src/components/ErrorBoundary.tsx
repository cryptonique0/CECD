import { Component, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to console for visibility
    console.error('Runtime error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h1>Something went wrong.</h1>
          <p>Please check the browser console for details.</p>
          {this.state.error && (
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {String(this.state.error.message)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
