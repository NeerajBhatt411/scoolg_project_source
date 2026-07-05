import { useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';

const Header = () => {
    const location = useLocation();
    const seg = location.pathname.split('/')[1] || 'dashboard';
    const title = seg.charAt(0).toUpperCase() + seg.slice(1);

    return (
        <header className="h-[64px] w-full shrink-0 sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between gap-4 px-4 md:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{title}</h2>

            <div className="flex items-center gap-3">
                <div className="relative hidden sm:block w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted border border-transparent focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/20 outline-none text-sm transition-all"
                        placeholder="Search…"
                        type="text"
                    />
                </div>
                <button className="size-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    <Bell className="size-5" />
                </button>
                <div className="size-9 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold shrink-0">SA</div>
            </div>
        </header>
    );
};

export default Header;
