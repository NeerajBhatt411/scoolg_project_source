import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { TrendingUpIcon, BoltIcon } from './Icons';

export default function Hero() {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"]
    });

    // Scroll Parallax - Deep Layers
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const yText = useTransform(scrollYProgress, [0, 1], [0, 100]); // Text moves slower than bg
    const yBack = useTransform(scrollYProgress, [0, 1], [0, 300]); // Background moves faster
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    // Mouse / Gyro Parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 40, damping: 30 });
    const springY = useSpring(mouseY, { stiffness: 40, damping: 30 });

    const rotateX = useTransform(springY, [-0.5, 0.5], [7, -7]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-7, 7]);

    // Text Parallax (Opposite to mouse)
    const textParallaxX = useTransform(springX, [-0.5, 0.5], [-15, 15]);
    const textParallaxY = useTransform(springY, [-0.5, 0.5], [-15, 15]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const charVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const SplitText = ({ children, className, delay = 0 }) => (
        <span className={`inline-block ${className}`}>
            {children.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: delay + i * 0.03, ease: "easeOut" }}
                    className="inline-block"
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </span>
    );

    return (
        <section ref={sectionRef} className="relative min-h-[95vh] flex items-center pt-20 pb-12 overflow-hidden bg-white transition-colors duration-300 dark:bg-slate-950 perspective-2000">
            {/* Living Mesh Gradient Background */}
            <motion.div
                style={{ y: yBack, opacity }}
                className="absolute inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.1),transparent_50%)] animate-mesh blur-3xl"></div>
                <div className="absolute top-[-20%] right-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] animate-mesh animation-delay-2000 blur-3xl"></div>
            </motion.div>

            {/* Floating Elements (Background) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200/20 rounded-full blur-[100px] mix-blend-multiply animate-blob dark:bg-purple-900/20"></div>
                <div className="absolute top-20 right-10 w-64 h-64 bg-blue-200/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000 dark:bg-blue-900/20"></div>
                <div className="absolute -bottom-32 left-20 w-80 h-80 bg-pink-200/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000 dark:bg-pink-900/20"></div>
            </div>

            {/* Spotlight */}
            <motion.div
                style={{ x: springX, y: springY }}
                className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 mix-blend-overlay z-0"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)] transform translate-x-1/2 translate-y-1/2" />
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Floating Text Content */}
                    <motion.div
                        className="flex flex-col items-center lg:items-start space-y-8 text-center lg:text-left relative z-20 w-full"
                        style={{ x: textParallaxX, y: textParallaxY, z: 50 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 text-blue-700 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm border border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50 backdrop-blur-sm"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse box-shadow-glow"></span>
                            New Generation EdTech
                        </motion.div>

                        <h1 className="w-full font-display text-5xl lg:text-7xl font-extrabold leading-[1.1] text-gray-900 tracking-tight dark:text-white flex flex-col items-center lg:items-start">
                            {/* Block 1: Smart School */}
                            <div className="w-full text-center lg:text-left overflow-visible">
                                <SplitText delay={0.2}>Smart School</SplitText>
                            </div>

                            {/* Block 2: Management */}
                            <div className="w-full text-center lg:text-left text-primary relative inline-block dark:text-blue-500 italic overflow-visible mt-2">
                                <SplitText delay={0.6}>Management</SplitText>
                                <motion.svg
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 1.5 }}
                                    className="absolute w-[200px] lg:w-full h-4 -bottom-2 lg:-bottom-2 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 text-blue-300 -z-10 dark:text-blue-900"
                                    viewBox="0 0 100 10"
                                    preserveAspectRatio="none"
                                >
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </motion.svg>
                            </div>
                        </h1>

                        <motion.p variants={charVariants} className="text-lg lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed dark:text-gray-400">
                            The ultimate operating system for modern schools. Elevate education with a seamless, narrative-driven interface.
                        </motion.p>

                        <motion.div variants={charVariants} className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-6">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(45, 108, 223, 0.5)" }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-primary/30 transition-all text-lg relative overflow-hidden group"
                            >
                                <span className="relative z-10">Get Started Now</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* 3D Image Container */}
                    <motion.div
                        style={{ y: yText, rotateX, rotateY }}
                        className="relative z-10 perspective-1000"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="relative group transform-style-3d">
                            <motion.div className="relative rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[8px] border-white/50 dark:border-slate-800/50 backdrop-blur-xl">
                                <img src="/student_hero.png" alt="Hero Image" className="w-full h-auto object-cover aspect-[4/5] lg:aspect-[3/4]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>
                            </motion.div>

                            {/* Floating High-Impact Elements - 3D Translated */}
                            <motion.div
                                style={{ z: 60, x: -30, y: 40 }}
                                className="absolute -top-6 -right-6 lg:-right-12 bg-white/80 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl border border-white/50 dark:bg-slate-900/80 dark:border-slate-700/50 max-w-[180px]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                                        <TrendingUpIcon className="w-5 h-5 font-bold" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-gray-900 dark:text-white">99.2%</div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Satisfaction</div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                style={{ z: 80, x: 30, y: -40 }}
                                className="absolute -bottom-8 -left-6 lg:-left-12 bg-primary/90 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl border border-white/20 text-white max-w-[200px]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <BoltIcon className="w-5 h-5 font-bold" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold leading-tight">Instant Sync</div>
                                        <div className="text-[10px] opacity-70 font-medium tracking-wide">REAL-TIME UPDATES</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
