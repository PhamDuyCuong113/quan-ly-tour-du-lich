import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, TicketPercent, X } from 'lucide-react';

const AdminVoucher = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [newPromo, setNewPromo] = useState({ code: '', discountType: 'PERCENT', discountValue: 0, startDate: '', endDate: '', usageLimit: 10 });

    const fetchPromos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/promotions');
            setPromotions(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchPromos(); }, []);

    const handleCreatePromo = async (e) => {
        e.preventDefault();
        try {
            await api.post('/promotions', newPromo);
            alert("Tạo mã thành công!");
            setShowPromoModal(false);
            fetchPromos();
        } catch (error) { alert("Lỗi tạo mã"); }
    };

    const getPromoStatus = (p) => {
        const now = new Date();
        const endDate = new Date(p.endDate);
        if (now > endDate) return { label: 'Hết hạn', color: 'bg-red-100 text-red-600' };
        if (p.currentUsage >= p.usageLimit) return { label: 'Hết lượt', color: 'bg-orange-100 text-orange-600' };
        return { label: 'Đang chạy', color: 'bg-green-100 text-green-600' };
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-300 animate-pulse">ĐANG TẢI VOUCHER...</div>;

    return (
        <div>
            <header className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Kho Voucher</h1>
                <button onClick={() => setShowPromoModal(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 flex items-center gap-2 shadow-xl transition-all"><Plus /> TẠO VOUCHER</button>
            </header>

            <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b">
                    <tr>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase">Mã / Giá trị</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase">Lượt dùng</th>
                        <th className="p-8 font-black text-gray-400 text-[10px] uppercase text-center">Trạng thái</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {promotions.map(p => {
                        const status = getPromoStatus(p);
                        return (
                            <tr key={p.promotionId} className="hover:bg-blue-50/20 transition-colors">
                                <td className="p-8">
                                    <p className="font-black text-blue-600 text-xl tracking-tighter uppercase">{p.code}</p>
                                    <p className="text-xs font-bold text-gray-400 mt-1">
                                        {p.discountType === 'PERCENT' ? `Giảm ${p.discountValue}%` : `Giảm ${new Intl.NumberFormat('vi-VN').format(p.discountValue)}đ`}
                                    </p>
                                </td>
                                <td className="p-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full transition-all" style={{ width: `${(p.currentUsage/p.usageLimit)*100}%` }}></div>
                                        </div>
                                        <span className="text-sm font-black text-gray-600">{p.currentUsage}/{p.usageLimit}</span>
                                    </div>
                                </td>
                                <td className="p-8 text-center">
                                        <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                            {status.label}
                                        </span>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {showPromoModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl">
                        <div className="flex justify-between mb-8"><h2 className="text-2xl font-black uppercase tracking-tight">Tạo Voucher</h2><button onClick={() => setShowPromoModal(false)}><X className="text-gray-400" /></button></div>
                        <form onSubmit={handleCreatePromo} className="space-y-4">
                            <input className="w-full p-4 bg-gray-100 rounded-2xl font-black text-blue-600 uppercase" placeholder="MÃ VOUCHER" onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} required />
                            <select className="w-full p-4 bg-gray-100 rounded-2xl font-bold" onChange={e => setNewPromo({...newPromo, discountType: e.target.value})}><option value="PERCENT">Giảm theo %</option><option value="FIXED">Giảm tiền mặt</option></select>
                            <input className="w-full p-4 bg-gray-100 rounded-2xl font-bold" type="number" placeholder="Giá trị giảm" onChange={e => setNewPromo({...newPromo, discountValue: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" className="p-4 bg-gray-100 rounded-2xl font-bold text-xs" onChange={e => setNewPromo({...newPromo, startDate: e.target.value})} required />
                                <input type="date" className="p-4 bg-gray-100 rounded-2xl font-bold text-xs" onChange={e => setNewPromo({...newPromo, endDate: e.target.value})} required />
                            </div>
                            <input type="number" className="w-full p-4 bg-gray-100 rounded-2xl font-bold" placeholder="Lượt dùng tối đa" onChange={e => setNewPromo({...newPromo, usageLimit: e.target.value})} required />
                            <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-700 shadow-xl transition-all uppercase">Phát hành</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVoucher;