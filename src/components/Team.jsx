export default function Team() {
    const members = [
        {
            name: "Neeraj Bhatt",
            role: "Software Developer",
            image: "https://ui-avatars.com/api/?name=Neeraj+Bhatt&background=0D8ABC&color=fff&size=256",
            bio: "Driving technical excellence and building scalable architectures for the next generation of education."
        },
        {
            name: "Navdeep Aggarwal",
            role: "Software Developer",
            image: "https://ui-avatars.com/api/?name=Navdeep+Aggarwal&background=2D6CDF&color=fff&size=256",
            bio: "Passionate about creating intuitive user experiences and robust systems that empower schools worldwide."
        }
    ];

    return (
        <section className="py-24 bg-gray-50 transition-colors duration-300 dark:bg-slate-950 relative overflow-hidden">
            {/* Subtle background element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px] -z-10 dark:bg-blue-900/10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold tracking-wider uppercase text-xs bg-blue-100/50 px-4 py-1.5 rounded-full border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                        The Minds Behind SCoolG
                    </span>
                    <h2 className="mt-6 text-4xl font-display font-bold text-gray-900 tracking-tight sm:text-5xl dark:text-white">
                        Meet Our Team
                    </h2>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed dark:text-gray-400">
                        Dedicated professionals working tirelessly to redefine how schools manage education in the digital age.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                    {members.map((member, index) => (
                        <div key={index} className="group flex flex-col items-center p-10 bg-white rounded-[3rem] border border-gray-200 shadow-card hover:shadow-premium hover:border-primary/20 transition-all duration-500 relative dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-blue-700/50">
                            {/* Inner border ring for premium feel */}
                            <div className="absolute inset-2 rounded-[2.5rem] border border-gray-100/50 pointer-events-none dark:border-slate-800/20"></div>
                            <div className="relative mb-8">
                                <div className="w-28 h-28 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-primary to-blue-400 shadow-lg group-hover:rotate-6 transition-transform duration-500">
                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-900">
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full dark:border-slate-900"></div>
                            </div>

                            <div className="text-center">
                                <h3 className="text-2xl font-display font-bold text-gray-900 mb-1 dark:text-white">
                                    {member.name}
                                </h3>
                                <div className="flex justify-center mb-6">
                                    <span className="px-4 py-1.5 rounded-full bg-blue-50 text-primary text-xs font-bold uppercase tracking-widest border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                        {member.role}
                                    </span>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-sm dark:text-gray-400 line-clamp-3">
                                    {member.bio}
                                </p>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
