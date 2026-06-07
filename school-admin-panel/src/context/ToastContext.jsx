import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000); // auto dismiss after 4s
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
        warning: (msg) => addToast(msg, 'warning'),
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <span className="material-symbols-outlined text-[24px] text-emerald-500">check_circle</span>;
            case 'error': return <span className="material-symbols-outlined text-[24px] text-rose-500">error</span>;
            case 'warning': return <span className="material-symbols-outlined text-[24px] text-amber-500">warning</span>;
            default: return <span className="material-symbols-outlined text-[24px] text-blue-500">info</span>;
        }
    };

    const getBgStyle = (type) => {
        switch (type) {
            case 'success': return 'bg-emerald-50/90 border-emerald-200 shadow-emerald-500/10';
            case 'error': return 'bg-rose-50/90 border-rose-200 shadow-rose-500/10';
            case 'warning': return 'bg-amber-50/90 border-amber-200 shadow-amber-500/10';
            default: return 'bg-blue-50/90 border-blue-200 shadow-blue-500/10';
        }
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`pointer-events-auto flex items-center gap-3.5 p-4 pr-5 rounded-2xl shadow-xl border backdrop-blur-md min-w-[280px] max-w-sm ${getBgStyle(t.type)}`}
                        >
                            <div className="shrink-0 flex items-center justify-center bg-white rounded-full w-10 h-10 shadow-sm">
                                {getIcon(t.type)}
                            </div>
                            <span className="text-[13px] font-bold text-slate-700 leading-snug flex-1">{t.message}</span>
                            <button
                                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors ml-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
