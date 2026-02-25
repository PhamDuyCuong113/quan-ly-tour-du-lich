import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, TicketPercent, ChevronLeft } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/admin/tours', name: 'Quản lý Tour', icon: <Map size={20} /> },
        { path: '/admin/vouchers', name: 'Quản lý Voucher', icon: <TicketPercent size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="w-72 bg-gray-900 text-white p-8 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-12 border-b border-gray-800 pb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><LayoutDashboard size={24} /></div>
                    <h2 className="text-2xl font-black tracking-tighter italic">ADMIN HUB</h2>
                </div>
                <nav className="space-y-2">
                    {menuItems.map((item) => (
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
                    <Link to="/" className="flex items-center gap-2 text-gray-500 mt-20 hover:text-white transition-colors">
                        <ChevronLeft size={16} /> Quay về trang chủ
                    </Link>
                </nav>
            </div>
            <div className="flex-1 p-10 overflow-y-auto">
                <Outlet /> {/* Nơi hiển thị AdminTour hoặc AdminVoucher */}
            </div>
        </div>
    );
};

export default AdminLayout;