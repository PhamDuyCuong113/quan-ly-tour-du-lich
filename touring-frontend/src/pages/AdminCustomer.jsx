import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search, UserCircle, Mail, User } from 'lucide-react';

const AdminCustomer = () => {
    const [customers, setCustomers] = useState([]); // Khởi tạo mảng rỗng
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/customers');
            console.log("Dữ liệu khách hàng:", res.data);

            if (Array.isArray(res.data)) {
                setCustomers(res.data);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error("Lỗi gọi API khách hàng:", error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Lọc khách hàng
    const filteredCustomers = Array.isArray(customers) ? customers.filter(c =>
        (c.fullName && c.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-gray-400 uppercase">Đang truy xuất danh bạ khách hàng...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic">Hệ thống khách hàng</h1>
                    <p className="text-gray-400 font-medium">Quản lý và theo dõi thông tin người dùng toàn hệ thống</p>
                </div>
                <div className="relative w-80">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest">Thông tin khách hàng</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest">Email liên hệ</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center">Loại khách</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.length === 0 ? (
                        <tr><td colSpan="3" className="p-20 text-center text-gray-400 font-bold">Không tìm thấy khách hàng nào 😅</td></tr>
                    ) : (
                        filteredCustomers.map(c => (
                            <tr key={c.customerId} className="hover:bg-blue-50/20 transition-colors">
                                <td className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                                            {c.fullName ? c.fullName.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 text-lg tracking-tight">{c.fullName}</p>
                                            <p className="text-[10px] font-black text-blue-500 uppercase">ID: #{c.customerId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8 font-bold text-gray-600 italic">{c.email || 'Chưa cập nhật'}</td>
                                <td className="p-8 text-center">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                            c.customerType === 'VIP' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {c.customerType || 'NORMAL'}
                                        </span>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center px-4">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Tổng số: {filteredCustomers.length} người dùng</p>
            </div>
        </div>
    );
};

export default AdminCustomer;