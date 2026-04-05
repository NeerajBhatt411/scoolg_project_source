import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Image, LogOut, Settings, HelpCircle, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const schoolName = localStorage.getItem('scoolg_school_name') || 'School Admin';

    const handleLogout = () => {
        localStorage.removeItem('scoolg_token');
        localStorage.removeItem('scoolg_school_id');
        localStorage.removeItem('scoolg_school_name');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'School Profile', icon: <User size={20} />, path: '/profile' },
        { name: 'Media Gallery', icon: <Image size={20} />, path: '/gallery' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    ];

    return (
        <div className="glass-dark sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '24px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
                <div style={{ background: '#2563eb', padding: '8px', borderRadius: '10px' }}>
                    <ShieldCheck size={24} color="#fff" />
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>SCOOLG</h1>
            </div>

            <div style={{ flex: 1 }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '16px', paddingLeft: '12px' }}>Menu</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                                background: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                                transition: 'all 0.2s',
                                border: isActive ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent'
                            })}
                        >
                            {item.icon}
                            {item.name}
                        </NavLink>
                    ))}
                </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingLeft: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(45deg, #2563eb, #6366f1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#fff', fontSize: '18px', fontWeight: '700' }}>
                        {schoolName[0]}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{schoolName}</p>
                        <p style={{ fontSize: '12px', opacity: 0.5 }}>Active Plan</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: 'rgba(255,255,255,0.6)', background: 'transparent', fontSize: '15px', fontWeight: '600' }}>
                        <HelpCircle size={20} />
                        Support
                    </button>
                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', fontSize: '15px', fontWeight: '600' }}>
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
