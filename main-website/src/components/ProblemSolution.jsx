import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { AlertCircle, CheckCircle2, Zap, Cloud, Shield, Database } from 'lucide-react';

export default function ProblemSolution() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Smooth out the scroll progress for a "weighty" feel
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.5 });

    // Scene 1: Chaos (0% - 40%)
    const chaosOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);
    const chaosScale = useTransform(smoothProgress, [0, 0.3], [1, 1.2]);
    const chaosY = useTransform(smoothProgress, [0, 0.3], ["0%", "-10%"]);

    // Scene 2: Harmony (40% - 100%)
    // Trigger opacity much earlier and keep it visible longer for mobile safety
    const harmonyOpacity = useTransform(smoothProgress, [0.35, 0.5], [0, 1]);
    const harmonyScale = useTransform(smoothProgress, [0.35, 0.5], [0.9, 1]);
    // Removed harmonyRotateX for performance

    // Background Color Transition
    const bgColor = useTransform(smoothProgress, [0.3, 0.5], ["#f8fafc", "#ffffff"]);
    const darkBgColor = useTransform(smoothProgress, [0.3, 0.5], ["#0f172a", "#020617"]);

    const problems = [
        "Manual Paperwork Chaos", "Fragmented Communication", "Insecure Data Storage", "Delayed Fee Tracking",
        "Lost Records", "Staff Burnout", "Parent Complaints", "Audit Failures"
    ];

    const solutions = [
        { title: "Paperless", icon: Cloud },
        { title: "Unified", icon: Zap },
        { title: "Secure", icon: Shield },
        { title: "Real-time", icon: Database }
    ];

    return (
        <motion.section
            ref={containerRef}
            className="relative h-[250vh] md:h-[300vh]" // Reduced height for mobile to reach end faster
            style={{ backgroundColor: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? darkBgColor : bgColor }}
        >
            <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center perspective-1000">

                {/* SCENE 1: CHAOS (Explodes outwards) */}
                <motion.div
                    style={{ opacity: chaosOpacity, scale: chaosScale, y: chaosY }}
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4"
                >
                    <h2 className="text-4xl md:text-8xl font-black text-gray-200 dark:text-gray-800 uppercase tracking-tighter mb-12 text-center relative z-10 w-full px-2">
                        The Old Way <br /><span className="text-red-500/50">Is Broken</span>
                    </h2>

                    {/* Floating Debris Field - optimized for mobile (fewer, tighter spread) */}
                    <div className="absolute inset-0 overflow-hidden hidden md:block w-full">
                        {problems.map((p, i) => {
                            const xOffset = (i % 3 - 1) * 20; // Tighter spread
                            const yOffset = (Math.floor(i / 3) - 1) * 20;

                            return (
                                <motion.div
                                    key={i}
                                    style={{
                                        x: useTransform(smoothProgress, [0, 0.3], [`${xOffset}%`, `${xOffset * 1.5}%`]),
                                        y: useTransform(smoothProgress, [0, 0.3], [`${yOffset}%`, `${yOffset * 1.5}%`]),
                                        opacity: useTransform(smoothProgress, [0, 0.2], [1, 0])
                                    }}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] md:w-48 p-2 md:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md md:shadow-lg border border-red-50 dark:border-red-900/20 flex flex-col items-center gap-1 md:gap-2 will-change-transform"
                                >
                                    <AlertCircle className="text-red-400 w-4 h-4 md:w-6 md:h-6" />
                                    <span className="text-[9px] md:text-xs font-bold text-gray-600 dark:text-gray-400 text-center leading-tight">{p}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>


                {/* SCENE 2: HARMONY (Assembles from center) */}
                <motion.div
                    style={{ opacity: harmonyOpacity, scale: harmonyScale }}
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
                >
                    <motion.div
                        className="relative z-20 text-center flex flex-col items-center justify-center w-full px-4"
                    >
                        {/* Animated Digital Core */}
                        <div className="mb-8 md:mb-12 relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
                            {/* Inner Pulsing Core */}
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-500 rounded-full blur-xl opacity-50"
                            />
                            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center z-10 shadow-2xl shadow-primary/30 border border-white/20">
                                <Zap className="w-10 h-10 md:w-14 md:h-14 text-primary fill-primary/20" />
                            </div>

                            {/* Orbiting Rings */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-10px] rounded-full border border-primary/20 border-dashed"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-[-25px] rounded-full border border-blue-400/20"
                            />
                        </div>

                        <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8 md:mb-16">
                            SCoolG unifies your entire school ecosystem into one elegant, automated operating system.
                        </p>
                    </motion.div>

                    {/* Solution Cards Assembling */}
                    <div className="flex flex-wrap justify-center content-center gap-3 md:gap-6 max-w-6xl w-full">
                        {solutions.map((s, i) => (
                            <motion.div
                                key={i}
                                style={{
                                    y: useTransform(smoothProgress, [0.35, 0.5], [50 + i * 20, 0]),
                                    opacity: useTransform(smoothProgress, [0.35 + i * 0.03, 0.5], [0, 1])
                                }}
                                className="w-full max-w-[280px] md:w-48 p-3 md:p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-row items-center gap-4 shadow-sm md:shadow-xl shadow-gray-200/50 dark:shadow-none hover:scale-105 transition-transform duration-300 md:flex-col md:text-center md:h-40 md:justify-center will-change-transform"
                            >
                                <div className="shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <s.icon className="w-5 h-5 md:w-6 md:h-6 text-primary dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight text-left">{s.title}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Progress Bar for the Section */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 h-32 w-1 bg-gray-200 dark:bg-slate-800 rounded-full hidden md:block">
                    <motion.div
                        style={{ height: smoothProgress }}
                        className="w-full bg-primary rounded-full origin-top"
                    />
                </div>

            </div>
        </motion.section>
    );
}
