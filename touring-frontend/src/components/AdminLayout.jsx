import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    TicketPercent,
    ChevronLeft,
    Users, // Đã thêm icon này
    UserCircle
} from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();

    // LẤY ROLE TỪ LOCALSTORAGE ĐỂ PHÂN QUYỀN MENU
    const role = localStorage.getItem('role');

    const menuItems = [
        // Staff và Admin đều thấy
        { path: '/admin/tours', name: 'Quản lý Tour', icon: <Map size={20} />, roles: ['ADMIN', 'STAFF'] },
        { path: '/admin/vouchers', name: 'Quản lý Voucher', icon: <TicketPercent size={20} />, roles: ['ADMIN', 'STAFF'] },

        // Chỉ Admin mới thấy
        { path: '/admin/staffs', name: 'Quản lý Nhân viên', icon: <Users size={20} />, roles: ['ADMIN'] },
        { path: '/admin/customers', name: 'Quản lý Khách hàng', icon: <UserCircle size={20} />, roles: ['ADMIN', 'STAFF'] },
    ];

    // Lọc menu dựa trên Role của người đang đăng nhập
    const filteredMenu = menuItems.filter(item => item.roles.includes(role));

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* --- SIDEBAR CỐ ĐỊNH --- */}
            <div className="w-72 bg-gray-900 text-white p-8 sticky top-0 h-screen shadow-2xl flex-shrink-0">
                <div className="flex items-center gap-3 mb-12 border-b border-gray-800 pb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black shadow-lg shadow-blue-900">
                        T
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic leading-none">Tour Admin</h2>
                        <p className="text-[10px] text-blue-400 font-bold mt-1 tracking-widest uppercase">{role}</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {filteredMenu.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${
                                location.pathname.includes(item.path) || (location.pathname === '/admin' && item.path === '/admin/tours')
                                    ? 'bg-blue-600 shadow-lg text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            {item.icon} {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-8 left-8">
                    <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-tighter">
                        <ChevronLeft size={16} /> Quay về trang chủ
                    </Link>
                </div>
            </div>

            {/* --- NỘI DUNG THAY ĐỔI THEO URL --- */}
            <div className="flex-1 p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;