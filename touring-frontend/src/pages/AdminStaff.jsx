import { useEffect, useState } from 'react';
import api from '../api/axios';
import { UserPlus, Mail, Phone, ShieldCheck, X, User, Lock, BadgeCheck } from 'lucide-react';

const AdminStaff = () => {
    // 1. KHAI BÁO STATES
    const [staffs, setStaffs] = useState([]); // Luôn mặc định là mảng rỗng
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [newStaff, setNewStaff] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: ''
    });

    // 2. HÀM LẤY DANH SÁCH NHÂN VIÊN (CÓ CHỐT CHẶN AN TOÀN)
    const fetchStaffs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/staffs');
            console.log("Dữ liệu gốc:", res.data);

            // res.data lúc này sẽ không còn bị lặp vô tận nữa
            if (Array.isArray(res.data)) {
                setStaffs(res.data);
            } else {
                setStaffs([]);
            }
        } catch (error) {
            setStaffs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffs();
    }, []);

    // 3. HÀM TẠO TÀI KHOẢN
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/staffs', newStaff);
            alert("Tạo tài khoản nhân viên thành công!");
            setShowModal(false);
            setNewStaff({ username: '', password: '', fullName: '', email: '', phone: '' }); // Reset form
            fetchStaffs(); // Tải lại danh sách
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi tạo tài khoản nhân viên");
        }
    };

    const handleToggleStatus = async (staff) => {
        // Lấy ID thông minh: thử cả 'id' và 'staffId'
        const id = staff.id || staff.staffId;

        if (!id) {
            console.error("Không tìm thấy ID của nhân viên:", staff);
            return;
        }

        const action = staff.status === 'ACTIVE' ? "KHÓA" : "MỞ KHÓA";
        if (window.confirm(`Bạn có chắc muốn ${action} nhân viên này?`)) {
            try {
                await api.patch(`/admin/staffs/${id}/toggle`);
                fetchStaffs();
                alert("Cập nhật thành công!");

            } catch (error) {
                alert("Lỗi: " + (error.response?.data?.message || "Không thể thực hiện"));
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black uppercase italic">Quản trị nhân sự</h1>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg">
                    <UserPlus size={20} /> THÊM NHÂN VIÊN
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase">Nhân viên</th>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase">Liên hệ</th>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase text-center">Trạng thái</th>
                        <th className="p-6 font-black text-gray-400 text-[10px] uppercase text-right">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {staffs.map(s => (
                        <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                            <td className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">
                                        {s.fullName.charAt(0)}
                                    </div>
                                    <p className="font-bold text-gray-800">{s.fullName}</p>
                                </div>
                            </td>
                            <td className="p-6">
                                <p className="text-sm font-medium text-gray-600">{s.email}</p>
                                <p className="text-xs text-gray-400">{s.phone}</p>
                            </td>
                            <td className="p-6 text-center">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    s.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                    {s.status === 'ACTIVE' ? 'Đang làm việc' : 'Đã dừng'}
                                </span>
                            </td>
                            <td className="p-6 text-right">
                                <button
                                    // TRUYỀN NGUYÊN CẢ ĐỐI TƯỢNG 's' VÀO THAY VÌ CHỈ TRUYỀN 's.id'
                                    onClick={() => handleToggleStatus(s)}
                                    className={`p-2 rounded-xl transition-all ${
                                        s.status === 'ACTIVE' ? 'text-red-400 hover:bg-red-50' : 'text-green-400 hover:bg-green-50'
                                    }`}
                                >
                                    {s.status === 'ACTIVE' ? <X size={20} /> : <BadgeCheck size={20} />}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 4. MODAL THÊM NHÂN VIÊN MỚI */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Cấp tài khoản mới</h2>
                                <p className="text-sm text-gray-400 font-medium mt-1">Thông tin đăng nhập dành cho nhân viên đại lý</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-full shadow-sm text-gray-300 hover:text-red-500 transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Tên đăng nhập (Username)</label>
                                    <div className="flex items-center bg-gray-100 rounded-2xl p-4 mt-1 border-2 border-transparent focus-within:border-blue-200 transition-all shadow-inner">
                                        <User className="text-gray-400 mr-3" size={20} />
                                        <input
                                            type="text"
                                            className="bg-transparent w-full font-bold text-gray-700 outline-none"
                                            placeholder="Nhập username..."
                                            value={newStaff.username || ''}
                                            onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Mật khẩu ban đầu</label>
                                    <div className="flex items-center bg-gray-100 rounded-2xl p-4 mt-1 border-2 border-transparent focus-within:border-blue-200 transition-all shadow-inner">
                                        <Lock className="text-gray-400 mr-3" size={20} />
                                        <input
                                            type="password"
                                            className="bg-transparent w-full font-bold text-gray-700 outline-none"
                                            placeholder="Tối thiểu 6 ký tự..."
                                            value={newStaff.password || ''}
                                            onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 border-t border-dashed pt-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Họ và tên nhân viên</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-gray-100 rounded-2xl mt-1 font-bold text-gray-700 outline-none border-2 border-transparent focus:border-blue-200 shadow-inner"
                                        placeholder="Ví dụ: NGUYỄN VĂN A"
                                        value={newStaff.fullName || ''}
                                        onChange={(e) => setNewStaff({...newStaff, fullName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Email liên hệ</label>
                                    <input
                                        type="email"
                                        className="w-full p-4 bg-gray-100 rounded-2xl mt-1 font-bold text-gray-700 outline-none border-2 border-transparent focus:border-blue-200 shadow-inner"
                                        placeholder="email@example.com"
                                        value={newStaff.email || ''}
                                        onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Số điện thoại</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-gray-100 rounded-2xl mt-1 font-bold text-gray-700 outline-none border-2 border-transparent focus:border-blue-200 shadow-inner"
                                        placeholder="09xx..."
                                        value={newStaff.phone || ''}
                                        onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 text-gray-400 font-black hover:text-gray-600 transition-all uppercase tracking-widest text-xs"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-blue-600 text-white py-4 rounded-[1.5rem] font-black hover:bg-black transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 uppercase tracking-tighter"
                                >
                                    <ShieldCheck size={20} /> KÍCH HOẠT TÀI KHOẢN
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStaff;