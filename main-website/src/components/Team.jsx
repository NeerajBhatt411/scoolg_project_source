import { motion } from 'framer-motion';
import { CodeIcon } from './Icons';
import neerajImg from '../assets/neeraj.png';
import navdeepImg from '../assets/navdeep.png';

export default function Team() {
    const members = [
        {
            name: "Neeraj Bhatt",
            role: "Software Developer",
            image: neerajImg,
            bio: "Driving technical excellence and building scalable architectures for the next generation of education."
        },
        {
            name: "Navdeep Aggarwal",
            role: "Software Developer",
            image: navdeepImg,
            bio: "Passionate about creating intuitive user experiences and robust systems that empower schools worldwide."
        }
    ];

    return (
        <section className="py-32 bg-white dark:bg-slate-950 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-4xl font-display font-bold text-gray-900 sm:text-5xl dark:text-white"
                    >
                        Masterminds
                    </motion.h2>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">The visionaries behind the platform.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    {members.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1, margin: "-50px" }}
                            transition={{ delay: i * 0.2 }}
                            whileHover={{ y: -10 }}
                            className="group relative"
                        >
                            {/* Holographic Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-blue-900/30 dark:to-purple-900/30"></div>

                            <div className="relative bg-white/50 backdrop-blur-md border border-white/60 p-8 rounded-[2.5rem] shadow-xl dark:bg-slate-900/50 dark:border-slate-800/60 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -mr-10 -mt-10"></div>

                                <div className="flex items-center gap-6 mb-6">
                                    <div className="relative">
                                        <div className="w-24 h-32 md:w-32 md:h-44 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-700 group-hover:scale-105 transition-transform duration-500">
                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-sm dark:bg-slate-800 z-10">
                                            <CodeIcon className="text-primary w-4 h-4 dark:text-blue-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                                        <p className="text-primary font-medium text-sm dark:text-blue-400">{member.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{member.bio}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
