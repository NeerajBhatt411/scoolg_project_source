export default function Hero() {
    return (
        <section className="relative pt-4 md:pt-20 pb-6 md:pb-12 overflow-hidden bg-white transition-colors duration-300 dark:bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-br from-soft-blue to-white -z-10 dark:from-slate-900 dark:to-slate-950"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-block px-4 py-1.5 bg-blue-100/80 text-primary rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                            New Generation EdTech
                        </div>
                        <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight text-gray-900 tracking-tight dark:text-white">
                            Smart School Management in <span className="text-primary relative inline-block dark:text-blue-500">
                                One Platform
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10 dark:text-blue-900/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </svg>
                            </span>
                        </h1>
                        <p className="text-base lg:text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal dark:text-gray-400">
                            Streamline administration, enhance learning, and connect your entire school community with our comprehensive, easy-to-use software designed for modern education.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 text-sm lg:text-base">
                                Start Free 3-Month Trial
                            </button>
                            <button className="bg-white border text-primary border-gray-200 hover:border-primary hover:bg-blue-50/50 px-8 py-3.5 rounded-xl font-semibold transition-all text-sm lg:text-base shadow-sm hover:shadow-md dark:bg-slate-900 dark:border-slate-800 dark:text-blue-400 dark:hover:bg-slate-800">
                                View Demo
                            </button>
                        </div>
                        <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-xs text-gray-500 font-medium dark:text-gray-400">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600 overflow-hidden dark:border-slate-900 dark:bg-slate-800">
                                    <img src="https://ui-avatars.com/api/?name=John+Doe&background=random" alt="User" />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600 overflow-hidden dark:border-slate-900 dark:bg-slate-800">
                                    <img src="https://ui-avatars.com/api/?name=Jane+Smith&background=random" alt="User" />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600 overflow-hidden dark:border-slate-900 dark:bg-slate-800">
                                    <img src="https://ui-avatars.com/api/?name=Bob+Jones&background=random" alt="User" />
                                </div>
                            </div>
                            <p>Trusted by <span className="text-gray-900 font-bold dark:text-white">100+</span> schools worldwide</p>
                        </div>
                    </div>

                    <div className="relative group perspective-1000">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform transition-transform duration-700 hover:scale-[1.02] hover:rotate-1 dark:border-slate-800">
                            <img
                                src="/student_hero.png"
                                alt="Happy student using tablet in modern school hallway"
                                className="w-full h-auto object-cover aspect-[4/3] grayscale-[0.2] dark:grayscale-0"
                            />

                            {/* Floating Element 1 - Attendance */}
                            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 animate-bounce-slow hidden sm:flex items-center gap-3 dark:bg-slate-900/90 dark:border-slate-700/50">
                                <div className="bg-green-100 p-2 rounded-lg text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium dark:text-gray-400">Attendance</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">98% Present</p>
                                </div>
                            </div>

                            {/* Floating Element 2 - Assignment */}
                            <div className="absolute bottom-12 right-8 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 animate-float hidden sm:flex items-center gap-3 dark:bg-slate-900/90 dark:border-slate-700/50">
                                <div className="bg-blue-100 p-2 rounded-lg text-primary dark:bg-blue-900/30 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium dark:text-gray-400">Homework</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">Submitted!</p>
                                </div>
                            </div>
                        </div>

                        {/* Background Decorative Blobs */}
                        <div className="absolute -z-10 -bottom-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-70 animate-pulse-slow dark:bg-blue-900/20"></div>
                        <div className="absolute -z-10 top-10 -left-10 w-56 h-56 bg-blue-300/20 rounded-full blur-2xl opacity-60 dark:bg-indigo-900/20"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
