import { useState } from 'react';
import { LightModeIcon, DarkModeIcon, MenuIcon, CloseIcon } from './Icons';

export default function Header({ isDarkMode, toggleTheme, onGetStartedClick }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 transition-colors duration-300 dark:bg-slate-900/90 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="SCoolG Logo" className="h-10 w-auto" />
                        <span className="font-display font-bold text-2xl text-gray-900 tracking-tight dark:text-white">SCoolG</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <a className="text-gray-600 hover:text-primary font-medium transition-colors dark:text-gray-300 dark:hover:text-white" href="#">Home</a>
                        <a className="text-gray-600 hover:text-primary font-medium transition-colors dark:text-gray-300 dark:hover:text-white" href="#features">Features</a>
                        <a className="text-gray-600 hover:text-primary font-medium transition-colors dark:text-gray-300 dark:hover:text-white" href="#how-it-works">How It Works</a>
                        <a className="text-gray-600 hover:text-primary font-medium transition-colors dark:text-gray-300 dark:hover:text-white" href="#apps">Apps</a>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <a className="text-primary font-medium hover:text-primary-hover px-4 dark:text-blue-400 dark:hover:text-blue-300" href="#">Log In</a>
                        <button onClick={onGetStartedClick} className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary/30">Get Started</button>

                        {/* Desktop Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-50 text-gray-600 transition-all hover:bg-gray-100 hover:scale-110 active:scale-95 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode
                                ? <LightModeIcon className="w-5 h-5" />
                                : <DarkModeIcon className="w-5 h-5" />
                            }
                        </button>
                    </div>

                    {/* Mobile Menu Button & Toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-50 text-gray-600 transition-all dark:bg-slate-800 dark:text-gray-300"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode
                                ? <LightModeIcon className="w-6 h-6" />
                                : <DarkModeIcon className="w-6 h-6" />
                            }
                        </button>
                        <button
                            className="p-2 text-gray-600 hover:text-primary transition-colors focus:outline-none dark:text-gray-300"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen
                                ? <CloseIcon className="w-7 h-7" />
                                : <MenuIcon className="w-7 h-7" />
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-lg animate-fade-in-down dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex flex-col p-4 space-y-4">
                        <a className="text-gray-600 hover:text-primary font-medium py-2 border-b border-gray-50 dark:text-gray-300 dark:border-slate-800" href="#" onClick={() => setIsMenuOpen(false)}>Home</a>
                        <a className="text-gray-600 hover:text-primary font-medium py-2 border-b border-gray-50 dark:text-gray-300 dark:border-slate-800" href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
                        <a className="text-gray-600 hover:text-primary font-medium py-2 border-b border-gray-50 dark:text-gray-300 dark:border-slate-800" href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How It Works</a>
                        <a className="text-gray-600 hover:text-primary font-medium py-2 border-b border-gray-50 dark:text-gray-300 dark:border-slate-800" href="#apps" onClick={() => setIsMenuOpen(false)}>Apps</a>
                        <div className="flex flex-col gap-3 pt-4">
                            <a className="text-primary font-medium hover:text-primary-hover py-2 text-center border border-primary/20 rounded-lg dark:text-blue-400 dark:border-blue-400/30" href="#">Log In</a>
                            <button onClick={() => { setIsMenuOpen(false); onGetStartedClick(); }} className="bg-primary hover:bg-primary-hover text-white py-3 w-full rounded-lg font-medium text-center shadow-lg shadow-primary/30">Get Started</button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
