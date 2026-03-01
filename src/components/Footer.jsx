import { MailIcon, CallIcon, LocationOnIcon } from './Icons';

export default function Footer({ isDarkMode }) {
    return (
        <footer className={`pt-20 pb-10 border-t border-white/5 transition-colors duration-300 bg-[#0F0D0B] text-gray-400`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/logo.png" alt="SCoolG Logo" className="h-10 w-auto opacity-90" />
                            <span className="font-display font-bold text-2xl tracking-tight text-white">SCoolG</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Empowering education through technology. The smart choice for modern schools.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white">Platform</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><a className="hover:text-primary transition-colors text-gray-400" href="#features">Features</a></li>
                            <li><a className="hover:text-primary transition-colors text-gray-400" href="#how-it-works">How It Works</a></li>
                            <li><a className="hover:text-primary transition-colors text-gray-400" href="#apps">Mobile Apps</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white">Support</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><a className="hover:text-primary transition-colors text-gray-400" href="#">Help Center</a></li>
                            <li><a className="hover:text-primary transition-colors text-gray-400" href="#">Contact Support</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white">Contact</h4>
                        <ul className="space-y-4 text-sm font-medium text-gray-400">
                            <li className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer">
                                <MailIcon className="text-primary w-5 h-5" />
                                hello@scoolg.com
                            </li>
                            <li className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer">
                                <CallIcon className="text-primary w-5 h-5" />
                                +91 76988 10025, 80108 55140
                            </li>
                            <li className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer">
                                <LocationOnIcon className="text-primary w-5 h-5" />
                                Noida, Uttar Pradesh
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-white/5`}>
                    <p className="text-sm font-medium">© 2024 SCoolG Inc. All rights reserved.</p>
                    <div className="flex gap-8 text-sm font-medium">
                        <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
