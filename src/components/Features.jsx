import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useRef } from 'react';

function SpotlightCard({ children, className = "" }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`group relative overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                          450px circle at ${mouseX}px ${mouseY}px,
                          rgba(45, 108, 223, 0.15),
                          transparent 80%
                        )
                    `
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
}

export default function Features() {
    const features = [
        {
            icon: "fact_check",
            title: "Automated Attendance",
            desc: "Biometric integration & one-tap marking.",
            colSpan: "md:col-span-2",
            bg: "bg-blue-50 dark:bg-blue-900/10"
        },
        {
            icon: "calendar_month",
            title: "Smart Timetable",
            desc: "Conflict-free scheduling algorithm.",
            colSpan: "md:col-span-1",
            bg: "bg-purple-50 dark:bg-purple-900/10"
        },
        {
            icon: "menu_book",
            title: "Digital Homework",
            desc: "Share notes, assignments & feedback instantly.",
            colSpan: "md:col-span-1",
            bg: "bg-green-50 dark:bg-green-900/10"
        },
        {
            icon: "payments",
            title: "Fee Management",
            desc: "Automated invoices, reminders & online collections.",
            colSpan: "md:col-span-2",
            bg: "bg-orange-50 dark:bg-orange-900/10"
        },
        {
            icon: "quiz",
            title: "Exam Intelligence",
            desc: "Analytics-driven report cards & success tracking.",
            colSpan: "md:col-span-3 lg:col-span-1",
            bg: "bg-pink-50 dark:bg-pink-900/10"
        },
        {
            icon: "notifications_active",
            title: "Instant Alerts",
            desc: "Real-time SMS & Push notifications for parents.",
            colSpan: "md:col-span-3 lg:col-span-2",
            bg: "bg-indigo-50 dark:bg-indigo-900/10"
        },
    ];

    return (
        <section id="features" className="py-24 bg-gray-50 dark:bg-slate-950 relative overflow-hidden scroll-mt-20 px-4">
            {/* Subtle background pattern for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-30 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] dark:opacity-20 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <span className="text-blue-600 font-bold tracking-wider uppercase text-xs bg-blue-100/50 px-4 py-1.5 rounded-full border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                        Powerhouse Features
                    </span>
                    <h2 className="mt-6 text-4xl font-display font-bold text-gray-900 sm:text-5xl dark:text-white">
                        Everything in <span className="text-primary italic">One Place</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.1, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`${feature.colSpan} h-full`}
                        >
                            <SpotlightCard className="h-full transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/10">
                                <div className={`p-8 h-full flex flex-col justify-between relative`}>
                                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-40 pointer-events-none ${feature.bg}`}></div>

                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm flex items-center justify-center mb-6 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-primary text-2xl dark:text-blue-400">{feature.icon}</span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">{feature.title}</h3>
                                        <p className="text-gray-500 text-sm font-medium leading-relaxed dark:text-gray-400">{feature.desc}</p>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
