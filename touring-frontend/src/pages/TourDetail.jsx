import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Calendar, Users, Star, MapPin, Tag,
    CheckCircle2, ChevronDown, Clock, Map, Info
} from 'lucide-react';

const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- 1. KHAI BÁO STATES ---
    const [tour, setTour] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [numPeople, setNumPeople] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [relatedTours, setRelatedTours] = useState([]);
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(true);

    // --- 2. GỌI API ĐỒNG BỘ ---
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Gọi 3 API cùng lúc để tối ưu hiệu năng
                const [tourRes, reviewRes, relatedRes] = await Promise.all([
                    api.get(`/tours/${id}`),
                    api.get(`/tours/${id}/reviews`),
                    api.get(`/tours/${id}/related`)
                ]);
                setTour(tourRes.data);
                setReviews(reviewRes.data);
                setRelatedTours(relatedRes.data);

                // Cuộn lên đầu trang mỗi khi đổi tour
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id]);

    // --- 3. XỬ LÝ ĐẶT TOUR ---
    const handleBooking = async () => {
        if (!selectedSchedule) return alert("Vui lòng chọn ngày khởi hành!");

        try {
            const bookingData = {
                scheduleId: selectedSchedule.scheduleId,
                numberOfPeople: numPeople,
                promotionCode: promoCode.trim()
            };
            const response = await api.post('/bookings', bookingData);
            alert("Đặt tour thành công! Mã đơn: #" + response.data.bookingId);
            navigate('/my-bookings');
        } catch (error) {
            // Lấy message lỗi từ Backend (Ví dụ: "Mã giảm giá hết lượt dùng")
            alert(error.response?.data?.message || "Đặt tour thất bại!");
            if (error.response?.status === 401) navigate('/login');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-blue-600 font-black uppercase tracking-widest animate-pulse">Đang chuẩn bị hành trình...</p>
        </div>
    );

    if (!tour) return <div className="text-center p-20 text-gray-500">Tour không tồn tại hoặc đã bị xóa.</div>;

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* --- CỘT TRÁI: THÔNG TIN CHI TIẾT --- */}
                <div className="lg:col-span-2">
                    {/* Header: Tên & Rating */}
                    <div className="mb-8">
                        <h1 className="text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight italic">
                            {tour.tourName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 bg-yellow-400 text-white px-5 py-2 rounded-2xl shadow-lg shadow-yellow-100">
                                <Star size={20} fill="currentColor" />
                                <span className="text-xl font-black">{tour.averageRating || '0.0'}</span>
                                <span className="text-xs font-bold opacity-80">| {reviews.length} đánh giá</span>
                            </div>
                            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
                                {tour.tourCode}
                            </div>
                            <div className="flex items-center gap-2 font-bold text-gray-500 border-l pl-5 border-gray-200">
                                <MapPin size={20} className="text-red-500" /> {tour.destination}
                            </div>
                        </div>
                    </div>

                    {/* Ảnh chính của Tour */}
                    <div className="rounded-[3.5rem] overflow-hidden shadow-2xl mb-12 h-[550px] border-8 border-white bg-gray-100">
                        <img
                            src={tour.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000'}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            alt={tour.tourName}
                        />
                    </div>

                    {/* Giới thiệu tổng quan */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-black mb-6 text-gray-800 flex items-center gap-3">
                            <Info className="text-blue-600" /> Giới thiệu chuyến đi
                        </h3>
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50 leading-relaxed text-xl text-gray-600 italic">
                            "{tour.description}"
                        </div>
                    </div>

                    {/* Lịch trình chi tiết (Itineraries) */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-black mb-8 text-gray-800 flex items-center gap-3">
                            <Map className="text-blue-600" /> Hành trình chi tiết
                        </h3>
                        <div className="space-y-4">
                            {tour.itineraries && tour.itineraries.length > 0 ? (
                                tour.itineraries.map((step) => (
                                    <details key={step.itineraryId} className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all">
                                        <summary className="font-black text-2xl text-gray-800 cursor-pointer list-none flex justify-between items-center">
                                            <span className="flex items-center gap-6">
                                                <span className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-sm font-black shadow-lg">
                                                    {step.dayNumber < 10 ? `0${step.dayNumber}` : step.dayNumber}
                                                </span>
                                                {step.title}
                                            </span>
                                            <ChevronDown className="text-blue-500 group-open:rotate-180 transition-transform duration-300" size={32} />
                                        </summary>
                                        <div className="mt-8 text-gray-600 leading-relaxed text-lg border-l-4 border-blue-100 pl-10 py-2 ml-6">
                                            {step.description}
                                        </div>
                                    </details>
                                ))
                            ) : (
                                <p className="text-gray-400 italic bg-gray-50 p-10 rounded-[2.5rem] text-center">Nội dung chi tiết từng ngày đang được cập nhật...</p>
                            )}
                        </div>
                    </div>

                    {/* Chọn ngày khởi hành (Schedules) */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-black mb-8 text-gray-800 flex items-center gap-3">
                            <Calendar className="text-blue-600" size={32} /> Lịch khởi hành hiện có
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {tour.schedules?.map(s => (
                                <div
                                    key={s.scheduleId}
                                    onClick={() => setSelectedSchedule(s)}
                                    className={`p-8 border-2 rounded-[3rem] cursor-pointer transition-all duration-300 ${
                                        selectedSchedule?.scheduleId === s.scheduleId
                                            ? 'border-blue-600 bg-blue-50 ring-8 ring-blue-50/50 shadow-inner'
                                            : 'border-gray-100 hover:border-blue-200 bg-white shadow-sm'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-10">
                                            <div className="bg-white p-5 rounded-3xl shadow-sm text-center min-w-[140px] border border-gray-50">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Khởi hành</p>
                                                <p className="font-black text-blue-600 text-2xl">{new Date(s.departureDate).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-800 text-2xl font-black">
                                                    Tình trạng: <span className="text-blue-600">{s.availableSlots} chỗ</span>
                                                </p>
                                                <div className="flex items-center gap-2 text-gray-400 mt-2 font-bold text-sm">
                                                    <Clock size={16}/> Chuyến đi kéo dài {tour.durationDays} ngày
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-4xl font-black text-gray-900 tracking-tighter">
                                            {new Intl.NumberFormat('vi-VN').format(s.price)}<span className="text-lg ml-1 font-bold">₫</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review của khách hàng */}
                    <div className="mt-24 border-t border-gray-100 pt-20">
                        <div className="flex justify-between items-end mb-12">
                            <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Trải nghiệm thực tế</h3>
                            <span className="text-gray-400 font-bold italic">{reviews.length} cảm nhận từ khách hàng</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {reviews.length === 0 ? (
                                <p className="text-gray-400 italic">Chưa có đánh giá nào cho chuyến đi này.</p>
                            ) : (
                                reviews.map(rev => (
                                    <div key={rev.reviewId} className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm relative hover:-translate-y-2 transition-transform">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                                                {rev.customerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 text-lg">{rev.customerName}</p>
                                                <div className="flex text-yellow-400 gap-1 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-gray-200"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 italic leading-relaxed text-lg">"{rev.comment}"</p>
                                        <p className="text-[10px] text-gray-300 mt-6 uppercase font-black tracking-widest">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: BOOKING CARD (STICKY) --- */}
                <div className="relative">
                    <div className="bg-white p-10 rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-50 sticky top-32 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0 opacity-50"></div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-10 text-gray-800 tracking-tighter">Đặt hành trình</h3>

                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Số lượng thành viên</label>
                                    <div className="flex items-center bg-gray-50 rounded-[2rem] p-6 mt-2 border border-transparent focus-within:border-blue-100 transition-all">
                                        <Users className="text-blue-500 mr-5" size={28} />
                                        <input
                                            type="number" min="1"
                                            value={numPeople}
                                            onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="bg-transparent w-full font-black text-3xl text-gray-800 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Mã Voucher giảm giá</label>
                                    <div className="flex items-center bg-gray-50 rounded-[2rem] p-6 mt-2 border-2 border-transparent focus-within:border-blue-100 transition-all">
                                        <Tag className="text-blue-500 mr-5" size={28} />
                                        <input
                                            type="text"
                                            className="bg-transparent w-full font-black text-xl text-gray-800 outline-none placeholder:text-gray-300 uppercase tracking-widest"
                                            placeholder="NHẬP TẠI ĐÂY..."
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-blue-200 text-center">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-60">Tổng thanh toán dự kiến</span>
                                    <p className="text-5xl font-black mt-3 flex items-center justify-center">
                                        {new Intl.NumberFormat('vi-VN').format((selectedSchedule?.price || 0) * numPeople)}
                                        <span className="text-2xl ml-1">₫</span>
                                    </p>
                                </div>

                                <button
                                    onClick={handleBooking}
                                    disabled={!selectedSchedule}
                                    className={`w-full py-7 rounded-[2.5rem] font-black text-xl transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${
                                        selectedSchedule
                                            ? 'bg-gray-900 text-white hover:bg-blue-700 shadow-blue-100 cursor-pointer'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {selectedSchedule ? (
                                        <>XÁC NHẬN ĐẶT TOUR <CheckCircle2 size={24}/></>
                                    ) : (
                                        'CHỌN NGÀY KHỞI HÀNH'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PHẦN TOUR LIÊN QUAN --- */}
            <div className="mt-40 border-t border-gray-100 pt-24 pb-20">
                <div className="text-center mb-20">
                    <h3 className="text-5xl font-black text-gray-900 uppercase tracking-tighter italic">Gợi ý dành riêng cho bạn</h3>
                    <p className="text-gray-400 mt-4 text-xl font-medium">Khám phá thêm những hành trình tương tự đến {tour.destination}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
                    {relatedTours.length > 0 ? (
                        relatedTours.map(t => (
                            <div
                                key={t.tourId}
                                onClick={() => navigate(`/tours/${t.tourId}`)}
                                className="cursor-pointer group bg-white rounded-[3rem] p-6 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 flex flex-col h-full"
                            >
                                <div className="h-56 rounded-[2.5rem] overflow-hidden mb-8 shadow-inner">
                                    <img
                                        src={t.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1000'}
                                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                                        alt={t.tourName}
                                    />
                                </div>
                                <h4 className="font-black text-2xl text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors mb-4 px-2 tracking-tighter">
                                    {t.tourName}
                                </h4>
                                <div className="flex justify-between items-center mt-auto px-2">
                                    <p className="text-blue-600 font-black text-xl tracking-tight">
                                        {new Intl.NumberFormat('vi-VN').format(t.basePrice)}đ
                                    </p>
                                    <div className="flex items-center text-xs font-black text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-2xl border border-yellow-100">
                                        <Star size={12} className="fill-current mr-1 text-yellow-500"/> {t.averageRating || '0.0'}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-4 text-center py-20 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-black uppercase text-sm tracking-widest">Chúng tôi đang cập nhật thêm tour tương tự...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TourDetail;