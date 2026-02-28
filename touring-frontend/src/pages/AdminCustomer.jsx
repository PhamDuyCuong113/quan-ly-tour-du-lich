import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
    Search,
    Mail,
    ShieldAlert,
    BadgeCheck,
    Loader2
} from 'lucide-react';

const AdminCustomer = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Lấy role từ localStorage để phân quyền giao diện
    const role = localStorage.getItem('role');
    const isAdmin = role === 'ADMIN';

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            // Admin: tất cả khách | Staff: khách do mình xử lý
            const res = await api.get('/admin/my-customers');
            if (Array.isArray(res.data)) {
                setCustomers(res.data);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách khách hàng:", error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Chỉ ADMIN mới được khóa / mở tài khoản
    const handleToggleStatus = async (customer) => {
        if (!isAdmin) return;

        const id = customer.customerId;
        const action =
            customer.accountStatus === 'ACTIVE' ? 'KHÓA' : 'MỞ KHÓA';

        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản khách hàng này?`)) {
            return;
        }

        try {
            await api.patch(`/admin/customers/${id}/toggle`);

            // Update UI tại chỗ
            setCustomers(prev =>
                prev.map(c =>
                    c.customerId === id
                        ? {
                            ...c,
                            accountStatus:
                                c.accountStatus === 'ACTIVE'
                                    ? 'LOCKED'
                                    : 'ACTIVE'
                        }
                        : c
                )
            );
        } catch (error) {
            alert(
                error.response?.data?.message ||
                'Không thể thực hiện thao tác'
            );
        }
    };

    // Lọc theo tìm kiếm
    const filteredCustomers = customers.filter(c =>
        (c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-blue-600">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="font-black uppercase tracking-widest text-sm italic">
                    Đang tải danh sách khách hàng...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic">
                        {isAdmin ? 'Hệ thống khách hàng' : 'Khách hàng của tôi'}
                    </h1>
                    <p className="text-gray-400 font-medium">
                        {isAdmin
                            ? 'Quản lý toàn bộ người dùng trên hệ thống'
                            : 'Danh sách khách đã đặt tour do bạn xử lý'}
                    </p>
                </div>

                <div className="relative w-96">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm khách hàng (Tên, Email)..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {/* TABLE */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b">
                    <tr>
                        <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Họ và Tên
                        </th>
                        <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                            Hạng / Loại
                        </th>
                        <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                            Trạng thái
                        </th>
                        {isAdmin && (
                            <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                                Thao tác
                            </th>
                        )}
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.length === 0 ? (
                        <tr>
                            <td
                                colSpan={isAdmin ? 4 : 3}
                                className="p-20 text-center text-gray-400 font-bold italic"
                            >
                                Không tìm thấy khách hàng nào 😅
                            </td>
                        </tr>
                    ) : (
                        filteredCustomers.map(c => (
                            <tr
                                key={c.customerId}
                                className="hover:bg-blue-50/20 transition-all"
                            >
                                {/* INFO */}
                                <td className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ${
                                                c.accountStatus === 'LOCKED'
                                                    ? 'bg-gray-400'
                                                    : 'bg-blue-600'
                                            }`}
                                        >
                                            {c.fullName
                                                ? c.fullName.charAt(0).toUpperCase()
                                                : '?'}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 text-lg">
                                                {c.fullName}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail size={12} className="text-gray-300" />
                                                <span className="text-xs text-gray-400 font-bold italic">
                                                        {c.email || 'N/A'}
                                                    </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* TYPE */}
                                <td className="p-8 text-center">
                                    <p className="font-black text-gray-700 text-xs">
                                        {c.customerType}
                                    </p>
                                    <p className="text-[10px] font-black text-orange-500 uppercase mt-1 italic tracking-widest">
                                        {c.level}
                                    </p>
                                </td>

                                {/* STATUS */}
                                <td className="p-8 text-center">
                                        <span
                                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                c.accountStatus === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                            }`}
                                        >
                                            {c.accountStatus === 'ACTIVE'
                                                ? 'Hoạt động'
                                                : 'Đã khóa'}
                                        </span>
                                </td>

                                {/* ACTION */}
                                {isAdmin && (
                                    <td className="p-8 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(c)}
                                            className={`p-3 rounded-xl transition-all ${
                                                c.accountStatus === 'ACTIVE'
                                                    ? 'text-red-400 hover:bg-red-50'
                                                    : 'text-green-500 hover:bg-green-50'
                                            }`}
                                            title={
                                                c.accountStatus === 'ACTIVE'
                                                    ? 'Khóa tài khoản'
                                                    : 'Mở khóa tài khoản'
                                            }
                                        >
                                            {c.accountStatus === 'ACTIVE' ? (
                                                <ShieldAlert size={24} />
                                            ) : (
                                                <BadgeCheck size={24} />
                                            )}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* FOOTER */}
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic px-4">
                Tổng số: {filteredCustomers.length} khách hàng
            </p>
        </div>
    );
};

export default AdminCustomer;