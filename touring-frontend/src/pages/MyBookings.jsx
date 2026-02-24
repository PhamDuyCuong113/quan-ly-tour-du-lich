import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, CreditCard, Users, X, UserPlus, CheckCircle2, Star } from 'lucide-react';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // States cho Modal Hành khách
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [passengers, setPassengers] = useState([]);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/my');
            setBookings(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Mở Modal và tạo sẵn mảng rỗng tương ứng với số người đã đặt
    const openPassengerModal = (booking) => {
        setSelectedBooking(booking);
        const initialPassengers = Array.from({ length: booking.numberOfPeople }, () => ({
            fullName: '',
            gender: 'MALE',
            dateOfBirth: '',
            idNumber: ''
        }));
        setPassengers(initialPassengers);
        setShowModal(true);
    };

    const handlePassengerChange = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index][field] = value;
        setPassengers(newPassengers);
    };

    const submitPassengers = async () => {
        try {
            await api.post(`/bookings/${selectedBooking.bookingId}/passengers`, passengers);
            alert("Cập nhật danh sách người đi thành công!");
            setShowModal(false);
            fetchBookings();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi cập nhật hành khách");
        }
    };

    const handlePayment = async (bookingId, amount) => {
        try {
            await api.post(`/bookings/${bookingId}/payments`, {
                paymentMethod: "BANK",
                amount: amount
            });
            alert("Thanh toán thành công!");
            fetchBookings();
        } catch (error) {
            alert("Thanh toán thất bại!");
        }
    };

    // Hàm xử lý viết đánh giá
    const handlePostReview = async (bookingId) => {
        const rating = prompt("Nhập số sao bạn đánh giá (1-5):");
        const comment = prompt("Nhập cảm nhận của bạn về chuyến đi:");

        if (rating && comment) {
            try {
                await api.post('/reviews', {
                    bookingId: bookingId,
                    rating: parseInt(rating),
                    comment: comment
                });
                alert("Cảm ơn bạn đã gửi đánh giá!");
            } catch (err) {
                alert(err.response?.data?.message || "Không thể gửi đánh giá");
            }
        }
    };

    if (loading) return <div className="text-center p-20 font-bold text-gray-400 animate-pulse">ĐANG TẢI ĐƠN HÀNG...</div>;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-black mb-8 flex items-center gap-2 uppercase tracking-tight">
                <Package className="text-blue-600" size={32} /> Đơn hàng của tôi
            </h1>

            <div className="space-y-6">
                {bookings.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm border border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold text-xl">Bạn chưa có đơn đặt tour nào 😅</p>
                    </div>
                ) : (
                    bookings.map(b => (
                        <div key={b.bookingId} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[10px] font-black bg-blue-50 px-3 py-1 rounded-full text-blue-500 uppercase tracking-widest">Đơn hàng #{b.bookingId}</span>
                                    <h3 className="text-2xl font-black text-gray-800 mt-3">{b.tourName}</h3>
                                    <p className="text-sm text-gray-400 font-medium">Ngày đặt: {new Date(b.bookingDate).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${
                                    b.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' :
                                        b.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                }`}>
                                    {b.status}
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-between items-end gap-6 border-t border-gray-50 pt-8">
                                <div className="flex gap-10">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Số khách</p>
                                        <p className="text-xl font-black text-gray-700">{b.numberOfPeople} người</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Tổng tiền</p>
                                        <p className="text-2xl font-black text-blue-600">
                                            {new Intl.NumberFormat('vi-VN').format(b.totalPrice)}đ
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {/* Nút dành cho đơn PENDING */}
                                    {b.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => openPassengerModal(b)}
                                                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
                                            >
                                                <Users size={18} /> THÊM NGƯỜI ĐI
                                            </button>
                                            <button
                                                onClick={() => handlePayment(b.bookingId, b.totalPrice)}
                                                className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                                            >
                                                <CreditCard size={18} /> THANH TOÁN
                                            </button>
                                        </>
                                    )}

                                    {/* Nút dành cho đơn CONFIRMED (Vị trí đúng của nút Đánh giá) */}
                                    {b.status === 'CONFIRMED' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePostReview(b.bookingId)}
                                                className="bg-yellow-100 text-yellow-700 px-6 py-3 rounded-2xl font-black text-sm hover:bg-yellow-500 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                <Star size={18} className="fill-current" /> ĐÁNH GIÁ TOUR
                                            </button>
                                            <div className="flex items-center text-green-600 font-black text-sm bg-green-50 px-6 py-3 rounded-2xl border border-green-100">
                                                <CheckCircle2 className="w-5 h-5 mr-2" /> ĐÃ HOÀN TẤT
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- MODAL NHẬP HÀNH KHÁCH --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-gray-800 tracking-tight">Người tham gia</h2>
                                <p className="text-sm text-gray-400 font-medium mt-1">Cung cấp thông tin để làm bảo hiểm du lịch</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-full shadow-sm text-gray-300 hover:text-red-500 transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="p-10 max-h-[60vh] overflow-y-auto space-y-10">
                            {passengers.map((p, index) => (
                                <div key={index} className="relative p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                    <div className="absolute -top-4 left-6 bg-blue-600 text-white px-4 py-1 rounded-full font-black text-xs shadow-lg">
                                        HÀNH KHÁCH {index + 1}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Họ và tên</label>
                                            <input
                                                type="text"
                                                className="w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 mt-1 font-bold text-gray-700"
                                                placeholder="VD: NGUYEN VAN A"
                                                value={p.fullName}
                                                onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Giới tính</label>
                                            <select
                                                className="w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 mt-1 font-bold text-gray-700"
                                                value={p.gender}
                                                onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                            >
                                                <option value="MALE">Nam</option>
                                                <option value="FEMALE">Nữ</option>
                                                <option value="OTHER">Khác</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Ngày sinh</label>
                                            <input
                                                type="date"
                                                className="w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 mt-1 font-bold text-gray-700 text-sm"
                                                value={p.dateOfBirth}
                                                onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">CCCD / Hộ chiếu</label>
                                            <input
                                                type="text"
                                                className="w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 mt-1 font-bold text-gray-700"
                                                placeholder="Nhập số giấy tờ tùy thân"
                                                value={p.idNumber}
                                                onChange={(e) => handlePassengerChange(index, 'idNumber', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-10 border-t border-gray-50 flex gap-6 bg-gray-50/50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 text-gray-400 font-black hover:text-gray-600 transition-all uppercase tracking-widest text-xs"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={submitPassengers}
                                className="flex-[2] bg-gray-900 text-white py-5 rounded-[1.5rem] font-black hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-2"
                            >
                                <UserPlus size={20} /> LƯU THÔNG TIN ĐOÀN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;