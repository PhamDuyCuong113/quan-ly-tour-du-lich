import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, ShieldCheck, Home as HomeIcon, Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showNoti, setShowNoti] = useState(false);
    const [notifications, setNotifications] = useState([]); // Khởi tạo mảng rỗng
    const token = localStorage.getItem('token');

    // Lấy thông tin cá nhân và thông báo khi có token
    useEffect(() => {
        if (token) {
            api.get('/auth/me')
                .then(res => setUser(res.data))
                .catch(() => handleLogout());

            api.get('/notifications/my')
                .then(res => {
                    // CHỐT CHẶN 1: Chỉ set nếu dữ liệu trả về thực sự là mảng
                    if (Array.isArray(res.data)) {
                        setNotifications(res.data);
                    } else {
                        setNotifications([]);
                    }
                })
                .catch(err => {
                    console.log("Chưa có thông báo hoặc lỗi API");
                    setNotifications([]); // Lỗi thì gán mảng rỗng để không bị sập app
                });
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    // CHỐT CHẶN 2: Tính toán số thông báo chưa đọc một cách an toàn
    const unreadNotifications = Array.isArray(notifications)
        ? notifications.filter(n => !n.isRead)
        : [];

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50 p-4 border-b border-gray-100">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter hover:opacity-80 transition-opacity">
                    TOURING.
                </Link>

                {/* Menu */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1">
                        <HomeIcon className="w-4 h-4" /> Trang chủ
                    </Link>

                    {user ? (
                        <>
                            <Link to="/my-bookings" className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1">
                                <Briefcase className="w-4 h-4" /> Đơn hàng
                            </Link>

                            {/* Menu dành riêng cho ADMIN */}
                            {user.role === 'ADMIN' || user.role ==='STAFF' && (
                                <Link to="/admin" className="flex items-center text-red-500 font-bold hover:text-red-700 bg-red-50 px-3 py-1 rounded-full transition-colors">
                                    <ShieldCheck className="w-4 h-4 mr-1" /> Quản lý
                                </Link>
                            )}

                            {/* Chuông Thông báo */}
                            <div className="relative cursor-pointer group" onClick={() => setShowNoti(!showNoti)}>
                                <Bell className="text-gray-600 w-6 h-6 group-hover:text-blue-600 transition-colors" />

                                {/* Dùng biến đã check an toàn ở trên */}
                                {unreadNotifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                                        {unreadNotifications.length}
                                    </span>
                                )}

                                {showNoti && (
                                    <div className="absolute right-0 mt-4 w-80 bg-white border rounded-2xl shadow-2xl p-4 z-50 max-h-[500px] overflow-y-auto">
                                        <h3 className="font-bold border-b pb-3 mb-2 text-gray-800">Thông báo mới nhất</h3>

                                        {/* Kiểm tra mảng trước khi map */}
                                        {!Array.isArray(notifications) || notifications.length === 0 ? (
                                            <p className="text-gray-400 text-sm text-center py-4">Không có thông báo nào</p>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.notificationId} className="py-3 border-b last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                                                    <p className="font-bold text-blue-600 text-sm">{n.title}</p>
                                                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{n.content}</p>
                                                    <p className="text-[10px] text-gray-300 mt-2">
                                                        {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Profile & Logout */}
                            <div className="flex items-center gap-4 border-l pl-6 ml-2">
                                <Link to="/profile" className="flex items-center gap-2 group">
                                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold group-hover:bg-blue-700 transition-colors">
                                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-xs text-gray-400 font-medium">Xin chào,</p>
                                        <p className="text-sm font-bold text-gray-700 group-hover:text-blue-600">{user.fullName}</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95">
                            Đăng nhập
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;