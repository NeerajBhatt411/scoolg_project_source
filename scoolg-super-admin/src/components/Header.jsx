import { useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();
    const pathName = location.pathname.split('/')[1];
    const title = pathName.charAt(0).toUpperCase() + pathName.slice(1);

    return (
        <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
            <div className="flex items-center justify-between w-full md:w-auto">
                <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">{title}</h2>
                <div className="flex md:hidden items-center gap-3">
                    <button className="h-9 w-9 flex items-center justify-center bg-slate-100 rounded-full">
                        <span className="material-symbols-outlined text-[20px] text-[#434655]">notifications</span>
                    </button>
                    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-white shadow-sm bg-primary flex items-center justify-center text-white font-bold text-xs">
                        SA
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64 group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                    <input
                        className="w-full h-10 pl-10 pr-4 rounded-xl border-none bg-surface-container-high focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all text-xs font-semibold outline-none"
                        placeholder="Search schools..."
                        type="text"
                    />
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <button className="hover:bg-[#e6e8ea] rounded-full p-2 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[#434655]">notifications</span>
                    </button>
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer bg-primary flex items-center justify-center text-white font-bold">
                        SA
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
