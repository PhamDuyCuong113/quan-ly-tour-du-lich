import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    TicketPercent,
    ChevronLeft,
    Users,
    UserCircle,
    ShoppingBag,
    ScrollText,
    Globe2,
    LogOut,
    Bell,
} from 'lucide-react';

/**
 * AdminLayout - tuân thủ Design System "Structured Clarity":
 *  - Sidebar navy 220px, sticky full-height
 *  - Topbar trắng 60px, sticky
 *  - contentInner: max-width 1440px, margin auto, padding 24px 28px
 */
const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username') || (role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên');

    const NAV_GROUPS = [
        {
            title: 'Tổng quan',
            items: [
                { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={16} />, roles: ['ADMIN', 'STAFF'] },
            ],
        },
        {
            title: 'Quản lý sản phẩm',
            items: [
                { path: '/admin/tours', name: 'Quản lý Tour', icon: <Map size={16} />, roles: ['ADMIN', 'STAFF'] },
                { path: '/admin/destinations', name: 'Điểm đến', icon: <Globe2 size={16} />, roles: ['ADMIN', 'STAFF'] },
                { path: '/admin/vouchers', name: 'Voucher', icon: <TicketPercent size={16} />, roles: ['ADMIN', 'STAFF'] },
            ],
        },
        {
            title: 'Vận hành',
            items: [
                { path: '/admin/bookings/manual', name: 'Đặt tại quầy', icon: <ShoppingBag size={16} />, roles: ['ADMIN', 'STAFF'] },
                { path: '/admin/customers', name: 'Khách hàng', icon: <UserCircle size={16} />, roles: ['ADMIN', 'STAFF'] },
                { path: '/admin/staffs', name: 'Nhân viên', icon: <Users size={16} />, roles: ['ADMIN'] },
            ],
        },
        {
            title: 'Hệ thống',
            items: [
                { path: '/admin/audit-logs', name: 'Audit Log', icon: <ScrollText size={16} />, roles: ['ADMIN', 'STAFF'] },
            ],
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* SIDEBAR */}
            <aside
                style={{
                    width: 'var(--sidebar-width)',
                    minWidth: 'var(--sidebar-width)',
                    maxWidth: 'var(--sidebar-width)',
                    background: 'var(--color-primary)',
                    color: 'var(--color-text-white)',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        padding: '16px 16px 14px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: 'var(--color-accent)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 14,
                        }}
                    >
                        T
                    </div>
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                            Touring Admin
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
                            {role || 'GUEST'}
                        </div>
                    </div>
                </div>

                <nav style={{ padding: '12px 10px', flex: 1 }}>
                    {NAV_GROUPS.map((group) => {
                        const items = group.items.filter((i) => i.roles.includes(role));
                        if (items.length === 0) return null;
                        return (
                            <div key={group.title} style={{ marginBottom: 12 }}>
                                <div
                                    style={{
                                        fontSize: 9.5,
                                        fontWeight: 700,
                                        color: 'rgba(255,255,255,0.35)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        padding: '10px 8px 4px',
                                    }}
                                >
                                    {group.title}
                                </div>
                                {items.map((it) => {
                                    const active = isActive(it.path);
                                    return (
                                        <Link
                                            key={it.path}
                                            to={it.path}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '7px 10px',
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: active ? '#fff' : 'rgba(255,255,255,0.82)',
                                                background: active ? 'var(--color-primary-light)' : 'transparent',
                                                borderRadius: 7,
                                                textDecoration: 'none',
                                                marginBottom: 2,
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!active) e.currentTarget.style.background = 'var(--color-primary-light)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!active) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            {it.icon}
                                            {it.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    })}
                </nav>

                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: 'rgba(255,255,255,0.55)',
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            textDecoration: 'none',
                        }}
                    >
                        <ChevronLeft size={14} /> Về trang chủ
                    </Link>
                </div>
            </aside>

            {/* CONTENT COLUMN */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
                <header
                    style={{
                        height: 'var(--header-height)',
                        background: 'var(--color-surface)',
                        borderBottom: '1px solid var(--color-border)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 28px',
                        minWidth: 0,
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {location.pathname.replace(/^\/admin\/?/, '/') || '/'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                            type="button"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                border: '1px solid var(--color-border)',
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-text-secondary)',
                                cursor: 'pointer',
                            }}
                            title="Thông báo"
                        >
                            <Bell size={18} />
                        </button>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                border: '1px solid var(--color-border)',
                                borderRadius: 8,
                                padding: '4px 10px 4px 4px',
                                background: '#fff',
                            }}
                        >
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: role === 'ADMIN' ? 'var(--color-primary)' : 'var(--color-info)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 700,
                                }}
                            >
                                {(username || '?').slice(0, 1).toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-primary)' }}>{username}</span>
                                <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)' }}>{role}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--color-border)',
                                borderRadius: 8,
                                padding: '7px 12px',
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: 'var(--color-danger)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                            }}
                        >
                            <LogOut size={14} /> Đăng xuất
                        </button>
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    <div
                        style={{
                            maxWidth: 'var(--container-max-width)',
                            margin: '0 auto',
                            padding: '24px 28px',
                            minWidth: 0,
                        }}
                    >
                        <div className="content-area">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
