export default function HowItWorks() {
    const steps = [
        {
            num: "01",
            icon: "domain",
            title: "Register Your School",
            description: "Transform your institution's digital presence in minutes. Simply upload your logo and set your academic structure.",
            tags: ["Instant Setup", "Branding"],
            color: "blue",
            visual: (
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/60 dark:shadow-none group-hover:scale-[1.02] transition-transform duration-500">
                    <img
                        src="/registration-3d.png"
                        alt="3D School Registration Illustration"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none"></div>
                </div>
            )
        },
        {
            num: "02",
            icon: "admin_panel_settings",
            title: "Configure Admin Panel",
            description: "Powerful tools at your fingertips. Manage students, staff, and classes from a single, intuitive control center.",
            tags: ["Admin Controls", "Scalable"],
            color: "indigo",
            visual: (
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/60 dark:shadow-none group-hover:scale-[1.02] transition-transform duration-500">
                    <img
                        src="/admin-dashboard-3d.png"
                        alt="3D Admin Dashboard Illustration"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/10 to-transparent pointer-events-none"></div>
                </div>
            )
        },
        {
            num: "03",
            icon: "assignment_ind",
            title: "Connect Community",
            description: "Real-time communication for everyone. Keep parents informed and students engaged with instant updates.",
            tags: ["Real-time", "Engagement"],
            color: "purple",
            visual: (
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-purple-200/60 dark:shadow-none group-hover:scale-[1.02] transition-transform duration-500">
                    <img
                        src="/community-3d.png"
                        alt="3D Community Illustration"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none"></div>
                </div>
            )
        }
    ];

    return (
        <section id="how-it-works" className="py-16 md:py-20 bg-white relative overflow-hidden dark:bg-slate-950 scroll-mt-20">
            {/* Background SVG Grid Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]">
                <svg className="w-full h-full" width="100%" height="100%">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-800" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Glowing Accents */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none dark:from-blue-900/5"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-purple-50/50 to-transparent pointer-events-none dark:from-purple-900/5"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* Sticky Sidebar Header */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            Easy Onboarding
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6 tracking-tight dark:text-white leading-tight">
                            Your Digital School in <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">3 Simple Steps</span>
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            We've simplified the complex process of school management into a three-step journey. No technical expertise required.
                        </p>
                        <div className="hidden lg:block space-y-4">
                            {steps.map((st, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-default">
                                    <div className="w-10 h-px bg-gray-200 group-hover:w-16 group-hover:bg-blue-600 transition-all duration-300 dark:bg-slate-800"></div>
                                    <span className="text-sm font-bold text-gray-400 group-hover:text-blue-600 dark:text-slate-600">{st.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bento Grid Content */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Step 1 - Large Card */}
                        <div className="md:col-span-2 group relative bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-200 shadow-2xl shadow-gray-200/60 overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:shadow-none transition-all duration-500 hover:-translate-y-2">
                            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center min-h-[350px]">
                                <div className="flex-1">
                                    <div className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Step {steps[0].num}</div>
                                    <h3 className="text-3xl font-display font-bold text-gray-900 mb-4 dark:text-white">{steps[0].title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">{steps[0].description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {steps[0].tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase dark:bg-blue-900/20 dark:text-blue-400">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full md:w-[400px] h-64 md:h-80 shrink-0">
                                    {steps[0].visual}
                                </div>
                            </div>
                            {/* Large Background Number */}
                            <div className="absolute -bottom-10 -right-4 text-[12rem] font-display font-black text-gray-50 dark:text-slate-800/20 select-none z-0">01</div>
                        </div>

                        {/* Step 2 & 3 - Side by Side */}
                        {steps.slice(1).map((step, idx) => (
                            <div key={idx} className="group relative bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-200 shadow-2xl shadow-gray-200/60 overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:shadow-none transition-all duration-500 hover:-translate-y-2 min-h-[500px]">
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Step {step.num}</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 dark:text-white">{step.title}</h3>
                                    <p className="text-gray-600 text-sm mb-8 dark:text-gray-400 leading-relaxed font-medium">{step.description}</p>
                                    <div className="mt-auto h-56">
                                        {step.visual}
                                    </div>
                                </div>
                                {/* Background Number */}
                                <div className="absolute -bottom-6 -right-2 text-[8rem] font-display font-black text-gray-50 dark:text-slate-800/10 select-none z-0">{step.num}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
