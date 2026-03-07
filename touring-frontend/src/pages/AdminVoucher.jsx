import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, TicketPercent, X, Edit3, Trash2, Loader2 } from 'lucide-react';

const AdminVoucher = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPromoModal, setShowPromoModal] = useState(false);

    // States cho việc Sửa
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);

    const [newPromo, setNewPromo] = useState({
        code: '',
        discountType: 'PERCENT',
        discountValue: 0,
        startDate: '',
        endDate: '',
        usageLimit: 10
    });

    const role = localStorage.getItem('role');
    const isAdmin = role === 'ADMIN';

    const fetchPromos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/promotions');
            if (Array.isArray(res.data)) {
                setPromotions(res.data);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách voucher:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPromos(); }, []);

    // Mở modal ở chế độ THÊM MỚI
    const handleOpenAddModal = () => {
        setIsEdit(false);
        setEditId(null);
        setNewPromo({ code: '', discountType: 'PERCENT', discountValue: 0, startDate: '', endDate: '', usageLimit: 10 });
        setShowPromoModal(true);
    };

    // Mở modal ở chế độ CHỈNH SỬA
    const handleOpenEditModal = (p) => {
        setIsEdit(true);
        setEditId(p.promotionId);
        setNewPromo({
            code: p.code,
            discountType: p.discountType,
            discountValue: p.discountValue,
            startDate: p.startDate,
            endDate: p.endDate,
            usageLimit: p.usageLimit
        });
        setShowPromoModal(true);
    };

    // Xử lý Gửi Form (Cả Thêm và Sửa)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                // Gọi API PUT để cập nhật
                await api.put(`/promotions/${editId}`, newPromo);
                alert("Cập nhật voucher thành công!");
            } else {
                // Gọi API POST để tạo mới
                await api.post('/promotions', newPromo);
                alert("Tạo voucher thành công!");
            }
            setShowPromoModal(false);
            fetchPromos();
        } catch (error) {
            alert(error.response?.data?.message || "Thao tác thất bại");
        }
    };

    // Xử lý XÓA
    const handleDelete = async (id, code) => {
        if (window.confirm(`Bạn có chắc muốn xóa vĩnh viễn mã khuyến mãi: ${code}?`)) {
            try {
                await api.delete(`/promotions/${id}`);
                alert("Đã xóa thành công!");
                fetchPromos();
            } catch (error) {
                alert("Không thể xóa mã này (có thể đã có khách sử dụng)");
            }
        }
    };

    const getPromoStatus = (p) => {
        const now = new Date();
        const endDate = new Date(p.endDate);
        now.setHours(0, 0, 0, 0);
        if (now > endDate) return { label: 'Hết hạn', color: 'bg-red-100 text-red-600' };
        if (p.currentUsage >= p.usageLimit) return { label: 'Hết lượt', color: 'bg-orange-100 text-orange-600' };
        return { label: 'Đang chạy', color: 'bg-green-100 text-green-600' };
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-blue-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">Đang truy xuất kho Voucher...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic">Kho Voucher</h1>
                    <p className="text-gray-400 font-medium">Danh sách mã giảm giá áp dụng hệ thống</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleOpenAddModal}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-blue-100 flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={22} /> TẠO VOUCHER
                    </button>
                )}
            </header>

            <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b">
                    <tr>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest">Mã / Chiết khấu</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center">Lượt dùng</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest text-center">Trạng thái</th>
                        {isAdmin && (
                            <th className="p-8 font-black text-gray-400 text-[10px] uppercase tracking-widest text-right">Thao tác</th>
                        )}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {promotions.map(p => {
                        const status = getPromoStatus(p);
                        return (
                            <tr key={p.promotionId} className="hover:bg-blue-50/20 transition-all duration-300">
                                <td className="p-8">
                                    <p className="font-black text-blue-600 text-xl tracking-tighter uppercase">{p.code}</p>
                                    <p className="text-xs font-bold text-gray-400 mt-1 italic">
                                        {p.discountType === 'PERCENT' ? `Giảm ${p.discountValue}%` : `Giảm ${new Intl.NumberFormat('vi-VN').format(p.discountValue)}đ`}
                                    </p>
                                </td>
                                <td className="p-8">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full transition-all" style={{ width: `${(p.currentUsage/p.usageLimit)*100}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-500">{p.currentUsage} / {p.usageLimit} Lượt</span>
                                    </div>
                                </td>
                                <td className="p-8 text-center">
                                    <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                        {status.label}
                                    </span>
                                    <p className="text-[9px] text-gray-300 font-bold mt-2 uppercase tracking-tighter">Hạn: {p.endDate}</p>
                                </td>

                                {isAdmin && (
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEditModal(p)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Sửa mã"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.promotionId, p.code)}
                                                className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                title="Xóa mã"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {showPromoModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">
                                {isEdit ? 'Cập nhật Voucher' : 'Tạo Voucher mới'}
                            </h2>
                            <button onClick={() => setShowPromoModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                <X className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Mã Code (Duy nhất)</label>
                                <input
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-black text-blue-600 uppercase border-2 border-transparent focus:border-blue-100 outline-none transition-all"
                                    placeholder="VÍ DỤ: HE2026"
                                    value={newPromo.code}
                                    onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Loại giảm</label>
                                    <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" value={newPromo.discountType} onChange={e => setNewPromo({...newPromo, discountType: e.target.value})}>
                                        <option value="PERCENT">Theo %</option>
                                        <option value="FIXED">Tiền mặt</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Giá trị</label>
                                    <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100" type="number" value={newPromo.discountValue} onChange={e => setNewPromo({...newPromo, discountValue: e.target.value})} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Ngày bắt đầu</label>
                                    <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs" value={newPromo.startDate} onChange={e => setNewPromo({...newPromo, startDate: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Ngày kết thúc</label>
                                    <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-xs" value={newPromo.endDate} onChange={e => setNewPromo({...newPromo, endDate: e.target.value})} required />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Lượt dùng tối đa</label>
                                <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-100" value={newPromo.usageLimit} onChange={e => setNewPromo({...newPromo, usageLimit: e.target.value})} required />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black hover:bg-black transition-all shadow-xl shadow-blue-100 uppercase tracking-widest mt-4">
                                {isEdit ? 'Xác nhận cập nhật' : 'Phát hành ngay'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVoucher;