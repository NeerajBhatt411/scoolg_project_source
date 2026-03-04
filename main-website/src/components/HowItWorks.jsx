import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Zap } from 'lucide-react';

const Card = ({ step, index, progress, range, targetScale }) => {
    const scale = useTransform(progress, range, [1, targetScale]);

    return (
        <div className="h-screen sticky top-0 flex items-center justify-center">
            <motion.div
                style={{ scale, top: `calc(10% + ${index * 25}px)` }}
                className="relative w-full max-w-5xl h-[60vh] md:h-[70vh] bg-white rounded-[3rem] p-8 md:p-12 border border-blue-100 shadow-2xl origin-top overflow-hidden dark:bg-slate-900 dark:border-slate-800"
            >
                <div className="h-full flex flex-col md:flex-row gap-12">
                    {/* Content Side */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 w-fit rounded-full text-blue-600 text-xs font-bold uppercase tracking-widest mb-6 dark:bg-blue-900/20 dark:text-blue-400">
                            Step 0{index + 1}
                        </div>
                        <h3 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6 dark:text-white leading-tight">
                            {step.title}
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            {step.description}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {step.tags.map(tag => (
                                <span key={tag} className="px-5 py-2 rounded-xl bg-gray-50 text-gray-700 font-bold text-sm border border-gray-100 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Visual Side */}
                    <div className="flex-1 rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-slate-800/50 relative group">
                        {step.visual}
                        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-500"></div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default function HowItWorks() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });

    const steps = [
        {
            title: "Register Your School",
            description: "Transform your institution's digital presence in minutes. Simply upload your logo and set your academic structure.",
            tags: ["Instant Setup", "Branding"],
            visual: (
                <div className="relative w-full h-full">
                    <img src="/registration-3d.png" alt="Registration" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
                </div>
            )
        },
        {
            title: "Configure Admin Panel",
            description: "Powerful tools at your fingertips. Manage students, staff, and classes from a single, intuitive control center.",
            tags: ["Admin Controls", "Scalable"],
            visual: (
                <div className="relative w-full h-full">
                    <img src="/admin-dashboard-3d.png" alt="Dashboard" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent"></div>
                </div>
            )
        },
        {
            title: "Connect Community",
            description: "Real-time communication for everyone. Keep parents informed and students engaged with instant updates.",
            tags: ["Real-time", "Engagement"],
            visual: (
                <div className="relative w-full h-full">
                    <img src="/community-3d.png" alt="Community" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent"></div>
                </div>
            )
        }
    ];

    return (
        <section id="how-it-works" ref={containerRef} className="relative bg-white dark:bg-slate-950 pt-20 scroll-mt-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                className="text-center max-w-3xl mx-auto px-6 mb-24"
            >
                <div className="inline-flex items-center gap-2 mb-6 text-primary font-bold uppercase tracking-widest text-sm">
                    <Zap className="w-4 h-4" />
                    The Journey
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter">
                    Your Digital <br /> Transformation
                </h2>
                <p className="text-xl text-gray-500 dark:text-gray-400">
                    Scroll to explore how SCoolG unifies your entire ecosystem.
                </p>
            </motion.div>

            {/* Sticky Cards Container */}
            <div className="w-full px-4 sm:px-6 md:px-12 pb-[50vh]">
                {steps.map((step, i) => {
                    const targetScale = 1 - ((steps.length - 1 - i) * 0.05);
                    return (
                        <Card
                            key={i}
                            step={step}
                            index={i}
                            progress={scrollYProgress}
                            range={[i * 0.25, 1]}
                            targetScale={targetScale}
                        />
                    );
                })}
            </div>
        </section>
    );
}
