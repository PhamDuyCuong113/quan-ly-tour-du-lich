import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    TicketPercent,
    ChevronLeft,
    Users,
    UserCircle
} from 'lucide-react';

const AdminLayout = () => {

    const location = useLocation();
    const role = localStorage.getItem('role');

    const menuItems = [
        { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'STAFF'] },
        { path: '/admin/tours', name: 'Quản lý Tour', icon: <Map size={20} />, roles: ['ADMIN', 'STAFF'] },
        { path: '/admin/vouchers', name: 'Quản lý Voucher', icon: <TicketPercent size={20} />, roles: ['ADMIN', 'STAFF'] },
        { path: '/admin/customers', name: 'Quản lý Khách hàng', icon: <UserCircle size={20} />, roles: ['ADMIN', 'STAFF'] },
        { path: '/admin/staffs', name: 'Quản lý Nhân viên', icon: <Users size={20} />, roles: ['ADMIN'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(role));

    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* SIDEBAR */}
            <div className="w-72 bg-gray-900 text-white p-8 sticky top-0 h-screen shadow-2xl flex-shrink-0">

                <div className="flex items-center gap-3 mb-12 border-b border-gray-800 pb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">
                        T
                    </div>

                    <div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic leading-none">
                            Tour Admin
                        </h2>
                        <p className="text-[10px] text-blue-400 font-bold mt-1 tracking-widest uppercase">
                            {role}
                        </p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {filteredMenu.map((item) => {

                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-8 left-8">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold text-xs uppercase"
                    >
                        <ChevronLeft size={16} />
                        Quay về trang chủ
                    </Link>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </div>

        </div>
    );
};

export default AdminLayout;