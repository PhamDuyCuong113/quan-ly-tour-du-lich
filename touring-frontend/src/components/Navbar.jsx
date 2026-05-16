import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, LogOut, ShieldCheck, Menu, X, Sun, Moon, Compass, Briefcase, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import api from '../api/axios';
import { useTheme } from '../hooks/useTheme';

const NAV_ITEMS = [
    { to: '/', label: 'Trang chủ' },
    { to: '/?cat=domestic', label: 'Tour trong nước' },
    { to: '/?cat=international', label: 'Tour quốc tế' },
];

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showNoti, setShowNoti] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggle } = useTheme();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!token) return;
        api.get('/auth/me').then(r => setUser(r.data)).catch(() => handleLogout());
        api.get('/notifications/my').then(r => Array.isArray(r.data) && setNotifications(r.data)).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        setUser(null);
        navigate('/login');
    };

    const unread = notifications.filter(n => !n.isRead);
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

    return (
        <>
            <header
                className={`sticky top-0 z-50 transition-all duration-300 tv-glass ${
                    scrolled ? 'shadow-[0_4px_20px_-8px_rgba(2,132,199,0.18)]' : ''
                }`}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white inline-flex items-center justify-center shadow-md group-hover:scale-110 transition">
                            <Compass className="w-5 h-5" />
                        </span>
                        <span className="text-xl font-extrabold tracking-tight text-[var(--tv-text)]">
                            TOURING<span className="text-sky-500">.</span>
                        </span>
                    </Link>

                    <ul className="hidden lg:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.label}>
                                <NavLink
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) =>
                                        `relative px-4 py-2 text-sm font-semibold rounded-full transition text-[var(--tv-text-soft)] hover:text-sky-600 ${isActive ? '!text-sky-500' : ''}`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <IconBtn onClick={toggle} title="Đổi giao diện">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </IconBtn>

                        {user ? (
                            <>
                                {isAdmin && (
                                    <Link to="/admin" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white transition">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Quản lý
                                    </Link>
                                )}

                                <div className="relative">
                                    <IconBtn onClick={() => setShowNoti(s => !s)} title="Thông báo">
                                        <Bell className="w-4 h-4" />
                                        {unread.length > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                                {unread.length}
                                            </span>
                                        )}
                                    </IconBtn>
                                    <AnimatePresence>
                                        {showNoti && (
                                            <Motion.div
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                className="absolute right-0 mt-2 w-80 bg-[var(--tv-surface)] border border-[var(--tv-border)] rounded-2xl shadow-xl p-3 z-50 max-h-[400px] overflow-y-auto"
                                            >
                                                <h3 className="font-bold text-[var(--tv-text)] mb-2 px-2">Thông báo</h3>
                                                {notifications.length === 0 ? (
                                                    <p className="text-sm text-[var(--tv-text-soft)] text-center py-4">Chưa có thông báo</p>
                                                ) : notifications.slice(0, 6).map(n => (
                                                    <div key={n.notificationId} className="p-3 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-500/5">
                                                        <p className="font-semibold text-sm text-sky-600">{n.title}</p>
                                                        <p className="text-xs text-[var(--tv-text-soft)] mt-1 line-clamp-2">{n.content}</p>
                                                    </div>
                                                ))}
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <Link to="/profile" className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-slate-200/50">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white font-bold text-sm flex items-center justify-center shadow">
                                        {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                </Link>
                                <IconBtn onClick={handleLogout} title="Đăng xuất">
                                    <LogOut className="w-4 h-4" />
                                </IconBtn>
                            </>
                        ) : (
                            <Link to="/login" className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg active:scale-95 transition">
                                Đăng nhập
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="lg:hidden w-9 h-9 rounded-full inline-flex items-center justify-center bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            aria-label="Mở menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </nav>
            </header>

            <AnimatePresence>
                {open && (
                    <Motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
                        <Motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-[var(--tv-surface)] shadow-2xl p-6 flex flex-col"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-extrabold text-[var(--tv-text)]">Menu</span>
                                <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 inline-flex items-center justify-center">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <ul className="mt-6 flex flex-col gap-1">
                                {NAV_ITEMS.map((it) => (
                                    <li key={it.label}>
                                        <NavLink
                                            to={it.to}
                                            end={it.to === '/'}
                                            onClick={() => setOpen(false)}
                                            className="block px-4 py-3 rounded-xl font-semibold text-[var(--tv-text)] hover:bg-sky-50 dark:hover:bg-sky-500/10"
                                        >
                                            {it.label}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto space-y-2">
                                {user ? (
                                    <>
                                        <Link to="/my-bookings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold">
                                            <Briefcase className="w-4 h-4" /> Đơn hàng
                                        </Link>
                                        <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold">
                                            <User className="w-4 h-4" /> {user.fullName || 'Hồ sơ'}
                                        </Link>
                                        {isAdmin && (
                                            <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 font-semibold">
                                                <ShieldCheck className="w-4 h-4" /> Quản lý
                                            </Link>
                                        )}
                                        <button onClick={() => { setOpen(false); handleLogout(); }} className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500 text-white font-bold">
                                            <LogOut className="w-4 h-4" /> Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" onClick={() => setOpen(false)} className="block text-center bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold py-3 rounded-xl shadow-md">
                                        Đăng nhập
                                    </Link>
                                )}
                            </div>
                        </Motion.aside>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const IconBtn = ({ children, onClick, title }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="relative w-9 h-9 rounded-full inline-flex items-center justify-center transition bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-sky-500/20"
    >
        {children}
    </button>
);

export default Navbar;
