import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Users, Star, MapPin, Tag, CheckCircle2 } from 'lucide-react';

const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [numPeople, setNumPeople] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Gọi song song 2 API để tối ưu tốc độ
                const [tourRes, reviewRes] = await Promise.all([
                    api.get(`/tours/${id}`),
                    api.get(`/tours/${id}/reviews`)
                ]);
                setTour(tourRes.data);
                setReviews(reviewRes.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id]);

    const handleBooking = async () => {
        if (!selectedSchedule) return alert("Vui lòng chọn ngày khởi hành!");

        try {
            const bookingData = {
                scheduleId: selectedSchedule.scheduleId,
                numberOfPeople: numPeople,
                promotionCode: promoCode.trim() // Gửi mã giảm giá lên Backend
            };
            const response = await api.post('/bookings', bookingData);
            alert("Đặt tour thành công! Mã đơn: #" + response.data.bookingId);
            navigate('/my-bookings');
        } catch (error) {
            // Hiển thị lỗi từ GlobalExceptionHandler của Backend (Ví dụ: Hết mã giảm giá)
            alert(error.response?.data?.message || "Đặt tour thất bại!");
            if (error.response?.status === 401) navigate('/login');
        }
    };

    if (loading) return <div className="text-center p-20 font-bold text-gray-400 animate-pulse">ĐANG TẢI THÔNG TIN TOUR...</div>;
    if (!tour) return <div className="text-center p-20">Tour không tồn tại hoặc đã bị xóa.</div>;

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* --- CỘT TRÁI: CHI TIẾT TOUR --- */}
                <div className="lg:col-span-2">
                    {/* Tên và địa điểm */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">{tour.tourName}</h1>
                        <div className="flex items-center gap-4 text-gray-500">
                            <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-blue-600">
                                {tour.tourCode}
                            </div>
                            <div className="flex items-center gap-1 font-medium">
                                <MapPin size={18} className="text-red-500" /> {tour.destination}
                            </div>
                        </div>
                    </div>

                    {/* Ảnh lớn */}
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 h-[450px]">
                        <img
                            src={tour.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000'}
                            className="w-full h-full object-cover"
                            alt={tour.tourName}
                        />
                    </div>

                    {/* Mô tả */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-black mb-4">Giới thiệu chuyến đi</h3>
                        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                            {tour.description || "Chưa có mô tả chi tiết cho tour này."}
                        </p>
                    </div>

                    {/* Chọn lịch trình */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                            <Calendar className="text-blue-600" /> Chọn ngày khởi hành
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {tour.schedules.length === 0 ? (
                                <p className="text-gray-400 italic">Hiện chưa có lịch khởi hành mới.</p>
                            ) : (
                                tour.schedules.map(s => (
                                    <div
                                        key={s.scheduleId}
                                        onClick={() => setSelectedSchedule(s)}
                                        className={`p-6 border-2 rounded-[2rem] cursor-pointer transition-all ${
                                            selectedSchedule?.scheduleId === s.scheduleId
                                                ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50'
                                                : 'border-gray-100 hover:border-blue-200 bg-white'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white p-3 rounded-2xl shadow-sm text-center min-w-[80px]">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase">Khởi hành</p>
                                                    <p className="font-bold text-gray-800">{new Date(s.departureDate).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">Tình trạng: <span className="text-blue-600">{s.availableSlots} chỗ trống</span></p>
                                                    <p className="text-xs text-gray-400">Giá vé người lớn</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-blue-600">
                                                    {new Intl.NumberFormat('vi-VN').format(s.price)}<span className="text-sm">₫</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Phần Đánh giá (Chuyển xuống dưới cùng) */}
                    <div className="mt-20 border-t pt-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black">Khách hàng nói gì?</h3>
                            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-2xl">
                                <Star className="text-yellow-500 fill-current" size={20} />
                                <span className="text-xl font-black text-yellow-700">{tour.averageRating || '0.0'}</span>
                                <span className="text-gray-400 text-sm">({reviews.length} đánh giá)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.length === 0 ? (
                                <p className="text-gray-400 italic col-span-2">Chưa có đánh giá nào cho tour này.</p>
                            ) : (
                                reviews.map(rev => (
                                    <div key={rev.reviewId} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-blue-100 ro unded-full flex items-center justify-center font-bold text-blue-600">
                                                {rev.customerName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{rev.customerName}</p>
                                                <div className="flex text-yellow-400 gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={10} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-gray-200"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm italic leading-relaxed">"{rev.comment}"</p>
                                        <p className="text-[10px] text-gray-300 mt-4 uppercase font-bold tracking-widest">
                                            {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: CARD ĐẶT TOUR (STICKY) --- */}
                <div className="relative">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-50 sticky top-24">
                        <h3 className="text-2xl font-black mb-6">Đặt chỗ ngay</h3>

                        {/* Số lượng người */}
                        <div className="mb-6">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Số lượng khách</label>
                            <div className="flex items-center bg-gray-50 rounded-2xl p-4 mt-1">
                                <Users className="text-blue-500 mr-3" size={20} />
                                <input
                                    type="number" min="1"
                                    value={numPeople}
                                    onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value)))}
                                    className="bg-transparent w-full font-bold text-gray-700 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Mã giảm giá */}
                        <div className="mb-8">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Mã khuyến mãi</label>
                            <div className="flex items-center bg-gray-50 rounded-2xl p-4 mt-1 border-2 border-transparent focus-within:border-blue-100 transition-all">
                                <Tag className="text-blue-500 mr-3" size={20} />
                                <input
                                    type="text"
                                    className="bg-transparent w-full font-bold text-gray-700 outline-none placeholder:text-gray-300"
                                    placeholder="VÍ DỤ: HE2026"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        {/* Tổng tiền tạm tính */}
                        <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-100 mb-6">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold uppercase opacity-80">Tổng thanh toán</span>
                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Tạm tính</span>
                            </div>
                            <p className="text-4xl font-black">
                                {new Intl.NumberFormat('vi-VN').format((selectedSchedule?.price || 0) * numPeople)}<span className="text-lg">₫</span>
                            </p>
                        </div>

                        <button
                            onClick={handleBooking}
                            disabled={!selectedSchedule}
                            className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                                selectedSchedule
                                    ? 'bg-black text-white hover:bg-blue-600'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {selectedSchedule ? 'ĐẶT TOUR NGAY' : 'CHỌN NGÀY ĐI'}
                        </button>

                        <p className="text-[10px] text-center text-gray-400 mt-4 font-medium italic">
                            * Hủy tour miễn phí trước 3 ngày khởi hành
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TourDetail;