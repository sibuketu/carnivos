import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    backgroundColor: '#1a1a1a',
                    color: '#ff4444',
                    height: '100vh',
                    overflow: 'auto',
                    fontFamily: 'monospace'
                }}>
                    <h1>⚠️ Critical Startup Error</h1>
                    <h2 style={{ color: 'white' }}>{this.state.error?.name}: {this.state.error?.message}</h2>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#ccc' }}>
                        <summary style={{ cursor: 'pointer', color: '#4da6ff' }}>Show Component Stack</summary>
                        {this.state.errorInfo?.componentStack}
                    </details>
                    <hr style={{ margin: '1rem 0', borderColor: '#444' }} />
                    <h3 style={{ color: 'white' }}>Stack Trace:</h3>
                    <pre style={{ backgroundColor: '#000', padding: '1rem', borderRadius: '4px' }}>
                        {this.state.error?.stack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            backgroundColor: '#444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        Reload App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
