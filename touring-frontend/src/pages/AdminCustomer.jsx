import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search, UserCircle, Mail, Phone, ShieldAlert, BadgeCheck, XCircle } from 'lucide-react';

const AdminCustomer = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/customers');
            if (Array.isArray(res.data)) setCustomers(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách khách hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    // Hàm xử lý Khóa/Mở khóa
    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus === 'ACTIVE' ? "KHÓA" : "MỞ KHÓA";
        if (window.confirm(`Bạn có chắc muốn ${action} tài khoản khách hàng này?`)) {
            try {
                await api.patch(`/admin/customers/${id}/toggle`);
                alert(`${action} thành công!`);
                fetchCustomers(); // Tải lại bảng
            } catch (error) {
                alert("Lỗi hệ thống, không thể thực hiện");
            }
        }
    };

    const filteredCustomers = customers.filter(c =>
        (c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-gray-300 uppercase">Đang truy xuất dữ liệu...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Quản lý khách hàng</h1>
                    <p className="text-gray-400 font-medium">Danh bạ người dùng và tình trạng tài khoản</p>
                </div>
                <div className="relative w-96">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm khách hàng (Tên, Email)..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b">
                    <tr>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest">Họ và Tên</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest">Thông tin liên lạc</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center">Loại khách / Hạng</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center">Trạng thái</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest text-right">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.map(c => (
                        <tr key={c.customerId} className="hover:bg-blue-50/20 transition-colors">
                            <td className="p-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ${c.accountStatus === 'LOCKED' ? 'bg-gray-400' : 'bg-blue-600'}`}>
                                        {c.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-800 text-lg tracking-tight">{c.fullName}</p>
                                        <p className="text-[10px] font-black text-blue-500">ID: #{c.customerId}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600"><Mail size={14} className="text-gray-300"/> {c.email || 'N/A'}</div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600"><Phone size={14} className="text-gray-300"/> {c.phone || 'N/A'}</div>
                                </div>
                            </td>
                            <td className="p-8 text-center">
                                <p className="font-black text-gray-700 text-xs">{c.customerType}</p>
                                <p className="text-[10px] font-black text-orange-500 uppercase mt-1">{c.level}</p>
                            </td>
                            <td className="p-8 text-center">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                        c.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {c.accountStatus === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                            </td>
                            <td className="p-8 text-right">
                                <button
                                    onClick={() => handleToggleStatus(c.customerId, c.accountStatus)}
                                    className={`p-3 rounded-xl transition-all ${
                                        c.accountStatus === 'ACTIVE'
                                            ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                                            : 'text-green-500 hover:bg-green-50 hover:text-green-700'
                                    }`}
                                    title={c.accountStatus === 'ACTIVE' ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                >
                                    {c.accountStatus === 'ACTIVE' ? <ShieldAlert size={24} /> : <BadgeCheck size={24} />}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest px-4 italic">Đang hiển thị {filteredCustomers.length} khách hàng</p>
        </div>
    );
};

export default AdminCustomer;