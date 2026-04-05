import React from 'react';
import { motion } from 'framer-motion';

const ComingSoon = ({ title = 'Coming Soon', subtitle = "We're working on it." }) => {
    return (
        <div className="p-8 min-h-[70vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="bg-surface-container-lowest premium-shadow rounded-2xl p-10 max-w-3xl w-full"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-on-surface">{title}</h3>
                        <p className="text-sm text-on-surface-variant font-medium">{subtitle}</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 mt-6 text-on-surface-variant font-semibold text-sm"
                >
                    <span>We are building this module</span>
                    <span className="inline-flex items-center gap-1">
                        <motion.span
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                        />
                        <motion.span
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }}
                        />
                        <motion.span
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
                        />
                    </span>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ComingSoon;
