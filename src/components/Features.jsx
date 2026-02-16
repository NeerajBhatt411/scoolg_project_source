export default function Features() {
    const features = [
        {
            icon: "fact_check",
            title: "Attendance",
            desc: "Automated tracking for students and staff with biometric integration options."
        },
        {
            icon: "calendar_month",
            title: "Timetable",
            desc: "Dynamic scheduling for classes, teachers, and exams with ease."
        },
        {
            icon: "menu_book",
            title: "Homework",
            desc: "Manage assignments, project work, and daily homework seamlessly."
        },
        {
            icon: "payments",
            title: "Fee Payments",
            desc: "Secure online fee collection with automated invoicing and reminders."
        },
        {
            icon: "quiz",
            title: "Exams & Results",
            desc: "Comprehensive exam management and automated report card generation."
        },
        {
            icon: "notifications_active",
            title: "Smart Notifications",
            desc: "Instant alerts for parents regarding attendance, results, and events."
        },
    ];

    return (
        <section id="features" className="py-24 bg-slate-50 relative overflow-hidden transition-colors duration-300 dark:bg-slate-950 scroll-mt-20">
            {/* Subtle background pattern for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] dark:opacity-40"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-blue-600 font-bold tracking-wider uppercase text-xs bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                        Core Capabilities
                    </span>
                    <h2 className="mt-6 text-4xl font-display font-bold text-gray-900 tracking-tight sm:text-5xl dark:text-white">
                        Everything you need to <br className="hidden md:block" /> run your school
                    </h2>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed dark:text-gray-400">
                        A unified platform that streamlines administrative tasks, allowing you to focus on what matters most: excellence in education.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white rounded-[2rem] p-10 border border-gray-200 shadow-card hover:shadow-premium hover:border-primary/20 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-700/50">
                            {/* Inner border ring for premium feel */}
                            <div className="absolute inset-2 rounded-[1.5rem] border border-gray-100 pointer-events-none dark:border-slate-800/10"></div>

                            {/* Hover Glow Effect */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-blue-50/50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 dark:bg-blue-900/10"></div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100/50 text-blue-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 dark:from-blue-900/40 dark:to-slate-800 dark:border-blue-800 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                                </div>
                                <h3 className="text-xl font-display font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors dark:text-white dark:group-hover:text-blue-400">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm dark:text-gray-400 font-medium">
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
