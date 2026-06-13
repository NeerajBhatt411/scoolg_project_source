import React from 'react';
import MenuButton from './MenuButton';
import ProfileButton from './ProfileButton';

const TopHeader = ({ title, showSearch = false, searchQuery, onSearchChange, placeholder = "Search..." }) => {
    return (
        <header className="h-[64px] md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-row justify-between items-center gap-4 px-4 md:px-8">
            <div className="flex items-center gap-2 md:w-auto">
                <MenuButton />
                <h2 className="text-xl md:text-[1.8rem] font-[900] text-foreground tracking-tight">{title}</h2>
            </div>
            <div className="flex items-center gap-4 md:w-auto justify-end">
                {showSearch && (
                    <div className="relative flex-1 md:w-80 lg:w-96 group hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[18px]">search</span>
                        <input
                            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-muted/30 focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all text-sm font-medium"
                            placeholder={placeholder}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    </div>
                )}
                <ProfileButton size={36} />
            </div>
        </header>
    );
};

export default TopHeader;
