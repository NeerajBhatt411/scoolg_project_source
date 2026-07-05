import React from 'react';

// A dynamic-import / stale-chunk failure (after a deploy, or a flaky network
// while loading a lazy page) — the class of error that used to leave a blank
// white screen until a manual reload.
const isChunkError = (e) => {
    const m = (e && (e.message || e.name || String(e))) || '';
    return /ChunkLoadError|Loading chunk|dynamically imported module|module script failed|Failed to fetch dynamically|error loading dynamically/i.test(m);
};

const RELOAD_KEY = 'sg-reloaded-once';

// App-wide safety net: instead of a blank white screen on ANY render error, we
// either auto-reload once (chunk/stale-asset errors, which a reload fixes) or
// show a friendly "Reload" fallback.
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, chunk: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, chunk: isChunkError(error) };
    }

    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error('[ErrorBoundary]', error, info);
        if (isChunkError(error) && sessionStorage.getItem(RELOAD_KEY) !== '1') {
            // A fresh set of assets is live — reload ONCE to fetch them (guarded
            // so we never loop). The guard is cleared on the next clean render.
            sessionStorage.setItem(RELOAD_KEY, '1');
            window.location.reload();
        }
    }

    componentDidMount() {
        // Reached a clean render -> allow a future auto-reload if assets go stale again.
        sessionStorage.removeItem(RELOAD_KEY);
    }

    render() {
        if (this.state.hasError) {
            if (this.state.chunk) return null; // reload already triggered; paint nothing meanwhile
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 p-8 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full grid place-items-center mx-auto mb-5">
                            <span className="material-symbols-outlined text-3xl">sync_problem</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Something went wrong</h2>
                        <p className="text-slate-500 text-sm font-medium mb-6">This screen hit an error. Reloading usually fixes it.</p>
                        <button onClick={() => window.location.reload()} className="w-full bg-blue-600 text-white font-black py-3.5 rounded-2xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs">
                            Reload
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
