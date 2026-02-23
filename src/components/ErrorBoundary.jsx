import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-screen h-[100dvh] bg-red-900 text-white flex flex-col items-center justify-center p-6 overflow-auto">
                    <h1 className="text-3xl font-black mb-4 flex items-center gap-2">
                        <span>⚠️</span> Application Crashed
                    </h1>
                    <div className="bg-black/50 p-4 rounded-xl max-w-2xl w-full text-left font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                        <p className="text-red-400 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                        <p className="text-slate-300 text-xs">{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="mt-6 px-6 py-3 bg-white text-red-900 font-bold rounded-xl shadow-lg hover:bg-slate-200 transition"
                    >
                        Clear Storage & Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
