import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

export default function MobileApps() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

    // 3D Rotations
    const rotateY = useTransform(smoothProgress, [0.2, 0.8], [45, -45]);
    const rotateX = useTransform(smoothProgress, [0.2, 0.8], [10, -10]);
    const phoneScale = useTransform(smoothProgress, [0.4, 0.6], [0.9, 1]);

    return (
        <section id="apps" ref={containerRef} className="py-32 bg-slate-50 dark:bg-slate-950 overflow-hidden perspective-2000 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20 space-y-4">
                    <span className="text-primary font-bold tracking-wider uppercase text-xs bg-blue-100/50 px-4 py-1.5 rounded-full border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                        Mobile First
                    </span>
                    <h2 className="text-4xl font-display font-bold text-gray-900 sm:text-5xl dark:text-white">
                        Your School in <span className="text-primary italic">Your Pocket</span>
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 perspective-1000">

                    {/* Phone 1: Student App */}
                    <motion.div
                        style={{ rotateY: 15, rotateX: 5 }}
                        className="relative w-[280px] h-[580px] bg-black rounded-[3.5rem] p-3 shadow-2xl border-4 border-gray-800 transform-style-3d group z-10"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0, rotateY: 0, rotateX: 0 }}
                        transition={{ duration: 1 }}
                    >
                        {/* Glossy Overlay */}
                        <div className="absolute inset-2 bg-gradient-to-tr from-white/20 to-transparent rounded-[3rem] z-20 pointer-events-none opacity-50"></div>

                        <div className="w-full h-full bg-slate-900 rounded-[3rem] overflow-hidden relative">
                            {/* Student UI */}
                            <div className="absolute top-0 w-full h-24 bg-blue-600 rounded-b-3xl"></div>
                            <div className="absolute top-12 left-6 text-white font-bold text-xl">Hi, Student!</div>

                            <div className="absolute top-32 left-4 right-4 space-y-4">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                                    <div className="text-xs text-gray-400 uppercase font-bold">Homework</div>
                                    <div className="text-lg font-bold text-white">Maths - Algebra</div>
                                    <div className="text-sm text-blue-400">Due Tomorrow</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                                        <div className="text-2xl font-bold text-green-400">A+</div>
                                        <div className="text-[10px] text-gray-400">Grade</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                                        <div className="text-2xl font-bold text-purple-400">95%</div>
                                        <div className="text-[10px] text-gray-400">Attendance</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-16 left-0 right-0 text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">Student App</p>
                            <p className="text-sm text-gray-500">Track Learning</p>
                        </div>
                    </motion.div>

                    {/* Text Description */}
                    <div className="text-center lg:text-left max-w-[90vw] lg:max-w-md space-y-6 mt-10 lg:mt-0">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800"
                        >
                            <h3 className="text-2xl font-bold mb-2 dark:text-white">For Students & Parents</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">Track homework, pay fees, and view real-time results instantly.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/20"
                        >
                            <h3 className="text-2xl font-bold mb-2 text-primary dark:text-blue-400">For Teachers</h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">Mark attendance in seconds and manage entire grading systems on the go.</p>
                        </motion.div>
                    </div>

                    {/* Phone 2: Teacher App */}
                    <motion.div
                        style={{ rotateY: -15, rotateX: 5 }}
                        className="relative w-[280px] h-[580px] bg-black rounded-[3.5rem] p-3 shadow-2xl border-4 border-gray-800 transform-style-3d group z-0 lg:-ml-10 lg:mt-20"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0, rotateY: 0, rotateX: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        {/* Glossy Overlay */}
                        <div className="absolute inset-2 bg-gradient-to-tr from-white/20 to-transparent rounded-[3rem] z-20 pointer-events-none opacity-50"></div>

                        <div className="w-full h-full bg-slate-900 rounded-[3rem] overflow-hidden relative">
                            {/* Teacher UI */}
                            <div className="absolute top-0 w-full h-24 bg-purple-600 rounded-b-3xl"></div>
                            <div className="absolute top-12 left-6 text-white font-bold text-xl">Teacher Panel</div>

                            <div className="absolute top-32 left-4 right-4 space-y-4">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase font-bold">Class 10-B</div>
                                        <div className="text-lg font-bold text-white">Physics</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">Start</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                                        <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                                        <div className="text-sm text-white">Upload Marks</div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                                        <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                                        <div className="text-sm text-white">Attendance</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-16 left-0 right-0 text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">Teacher App</p>
                            <p className="text-sm text-gray-500">Manage Classroom</p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
