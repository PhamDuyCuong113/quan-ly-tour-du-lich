import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Award,
    History,
    Calendar,
    ChevronRight,
    TrendingUp
} from 'lucide-react';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCustomerDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/customers/${id}`);
            setData(res.data);
        } catch (error) {
            console.error("Lỗi lấy chi tiết khách hàng:", error);
            alert(error.response?.data?.message || "Bạn không có quyền xem thông tin khách hàng này!");
            navigate('/admin/customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerDetail();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-blue-600">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="font-black uppercase tracking-widest text-sm italic">Đang truy xuất hồ sơ khách hàng...</p>
        </div>
    );

    if (!data) return null;

    const { customerInfo, bookingHistory, totalSpent } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- NÚT QUAY LẠI --- */}
            <button
                onClick={() => navigate('/admin/customers')}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold text-xs uppercase tracking-tighter transition-all group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Quay lại danh sách
            </button>

            {/* --- HEADER HỒ SƠ --- */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 z-0"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl ring-8 ring-blue-50">
                        {customerInfo.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{customerInfo.fullName}</h1>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                customerInfo.customerType === 'VIP' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {customerInfo.customerType}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3 text-gray-400 font-bold text-sm">
                            <span className="flex items-center gap-1"><Mail size={14} /> {customerInfo.email || 'N/A'}</span>
                            <span className="flex items-center gap-1"><Phone size={14} /> {customerInfo.phone || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] min-w-[280px] shadow-2xl relative z-10">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Tổng chi tiêu (LTV)</p>
                    <p className="text-4xl font-black text-blue-400 tracking-tighter">
                        {new Intl.NumberFormat('vi-VN').format(totalSpent)}<span className="text-xl ml-1">₫</span>
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400">
                        <TrendingUp size={14} className="text-green-400" /> Đóng góp {bookingHistory.length} đơn hàng
                    </div>
                </div>
            </div>

            {/* --- THÔNG TIN CHI TIẾT & HẠNG THÀNH VIÊN --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    {/* Thẻ Hạng */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Award size={16} className="text-orange-500" /> Đặc quyền thành viên
                        </h3>
                        <div className="text-center py-4">
                            <p className="text-sm font-bold text-gray-400 uppercase">Hạng hiện tại</p>
                            <p className="text-5xl font-black text-orange-500 mt-2 tracking-tighter uppercase italic">{customerInfo.level}</p>
                            <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <p className="text-xs font-bold text-orange-700">Tích lũy: {customerInfo.totalPoints} điểm</p>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ Địa chỉ */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <MapPin size={16} className="text-blue-500" /> Địa chỉ đăng ký
                        </h3>
                        <p className="text-gray-700 font-bold leading-relaxed italic">
                            "{customerInfo.address || 'Chưa cập nhật địa chỉ cụ thể trên hệ thống'}"
                        </p>
                    </div>
                </div>

                {/* --- BẢNG LỊCH SỬ BOOKING --- */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden h-full">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
                                <History size={20} className="text-blue-600" /> Nhật ký đặt tour
                            </h3>
                            <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-lg shadow-sm">
                                {bookingHistory.length} Giao dịch
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="p-8">Chuyến đi</th>
                                    <th className="p-8">Ngày đặt</th>
                                    <th className="p-8 text-center">Trạng thái</th>
                                    <th className="p-8 text-right">Giá trị</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {bookingHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-20 text-center text-gray-300 font-bold italic">Chưa có lịch sử giao dịch</td>
                                    </tr>
                                ) : (
                                    bookingHistory.map(b => (
                                        <tr key={b.bookingId} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="p-8">
                                                <p className="font-black text-gray-800 group-hover:text-blue-600 transition-colors">{b.tourName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Mã đơn: #{b.bookingId}</p>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                                                    <Calendar size={14} className="text-gray-300"/>
                                                    {new Date(b.bookingDate).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="p-8 text-center">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                        b.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' :
                                                            b.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                                    }`}>
                                                        {b.status}
                                                    </span>
                                            </td>
                                            <td className="p-8 text-right font-black text-gray-900 text-lg tracking-tighter">
                                                {new Intl.NumberFormat('vi-VN').format(b.totalPrice)}₫
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;