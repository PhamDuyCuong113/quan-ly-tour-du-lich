import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Users, Star, MapPin, Tag, CheckCircle2, ChevronDown, Clock } from 'lucide-react';

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

                // Cuộn lên đầu trang khi đổi tour
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
                promotionCode: promoCode.trim()
            };
            const response = await api.post('/bookings', bookingData);
            alert("Đặt tour thành công! Mã đơn: #" + response.data.bookingId);
            navigate('/my-bookings');
        } catch (error) {
            alert(error.response?.data?.message || "Đặt tour thất bại!");
            if (error.response?.status === 401) navigate('/login');
        }
    };

    if (loading) return <div className="text-center p-20 font-black text-blue-600 animate-pulse text-2xl uppercase tracking-tighter">Đang tải hành trình...</div>;
    if (!tour) return <div className="text-center p-20">Tour không tồn tại hoặc đã bị xóa.</div>;

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* --- CỘT TRÁI: THÔNG TIN CHI TIẾT --- */}
                <div className="lg:col-span-2">
                    {/* Tiêu đề & Rating */}
                    <div className="mb-8">
                        <h1 className="text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">{tour.tourName}</h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 bg-yellow-400 text-white px-5 py-2 rounded-2xl shadow-lg shadow-yellow-100">
                                <Star size={20} fill="currentColor" />
                                <span className="text-xl font-black">{tour.averageRating || '0.0'}</span>
                                <span className="text-xs font-bold opacity-80">| {reviews.length} đánh giá</span>
                            </div>
                            <div className="bg-gray-100 px-4 py-2 rounded-full text-xs font-black text-blue-600 uppercase tracking-widest">
                                {tour.tourCode}
                            </div>
                            <div className="flex items-center gap-2 font-bold text-gray-500 border-l pl-5">
                                <MapPin size={20} className="text-red-500" /> {tour.destination}
                            </div>
                        </div>
                    </div>

                    {/* Ảnh chính */}
                    <div className="rounded-[3.5rem] overflow-hidden shadow-2xl mb-12 h-[500px] border-8 border-white">
                        <img
                            src={tour.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000'}
                            className="w-full h-full object-cover"
                            alt={tour.tourName}
                        />
                    </div>

                    {/* Giới thiệu & Lịch trình (Accordion) */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-black mb-6 text-gray-800">Giới thiệu chuyến đi</h3>
                        <p className="text-gray-600 leading-relaxed text-xl mb-12 whitespace-pre-line">{tour.description}</p>

                        <h3 className="text-3xl font-black mb-8 text-gray-800 flex items-center gap-3">
                            Lịch trình chi tiết
                        </h3>
                        <div className="space-y-4">
                            {tour.itineraries && tour.itineraries.length > 0 ? (
                                tour.itineraries.map((step) => (
                                    <details key={step.itineraryId} className="group bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
                                        <summary className="font-black text-xl text-gray-800 cursor-pointer list-none flex justify-between items-center">
                                            <span className="flex items-center gap-4">
                                                <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm italic font-serif">
                                                    {step.dayNumber}
                                                </span>
                                                {step.title}
                                            </span>
                                            <ChevronDown className="text-blue-500 group-open:rotate-180 transition-transform" size={28} />
                                        </summary>
                                        <div className="mt-6 text-gray-600 leading-relaxed text-lg border-l-4 border-blue-100 pl-8 py-2 ml-5">
                                            {step.description}
                                        </div>
                                    </details>
                                ))
                            ) : (
                                <p className="text-gray-400 italic bg-gray-50 p-6 rounded-3xl text-center">Nội dung chi tiết từng ngày đang được cập nhật...</p>
                            )}
                        </div>
                    </div>

                    {/* Chọn ngày khởi hành */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-black mb-8 text-gray-800 flex items-center gap-3">
                            <Calendar className="text-blue-600" size={32} /> Ngày khởi hành hiện có
                        </h3>
                        <div className="grid grid-cols-1 gap-5">
                            {tour.schedules.map(s => (
                                <div
                                    key={s.scheduleId}
                                    onClick={() => setSelectedSchedule(s)}
                                    className={`p-8 border-2 rounded-[2.5rem] cursor-pointer transition-all ${
                                        selectedSchedule?.scheduleId === s.scheduleId
                                            ? 'border-blue-600 bg-blue-50 ring-8 ring-blue-50/50'
                                            : 'border-gray-100 hover:border-blue-200 bg-white shadow-sm'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-8">
                                            <div className="bg-white p-5 rounded-[1.5rem] shadow-sm text-center min-w-[120px] border border-gray-50">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Khởi hành</p>
                                                <p className="font-black text-blue-600 text-xl">{new Date(s.departureDate).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-800 text-xl font-black">Tình trạng: <span className="text-blue-600">{s.availableSlots} chỗ trống</span></p>
                                                <p className="text-sm text-gray-400 mt-1 font-medium">Giá đã bao gồm VAT & Bảo hiểm</p>
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

                    {/* Review của khách */}
                    <div className="mt-20 border-t border-gray-100 pt-16">
                        <h3 className="text-3xl font-black mb-10 text-gray-900 tracking-tight">Cảm nhận khách hàng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reviews.length === 0 ? (
                                <p className="text-gray-400 italic">Chưa có đánh giá nào cho chuyến đi này.</p>
                            ) : (
                                reviews.map(rev => (
                                    <div key={rev.reviewId} className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-sm border border-blue-50">
                                                {rev.customerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800">{rev.customerName}</p>
                                                <div className="flex text-yellow-400 gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-gray-200"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 italic leading-relaxed text-lg">"{rev.comment}"</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: BOOKING CARD (STICKY) --- */}
                <div className="relative">
                    <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-50 sticky top-28">
                        <h3 className="text-3xl font-black mb-8 text-gray-800 tracking-tighter">Đặt tour</h3>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Số lượng khách</label>
                                <div className="flex items-center bg-gray-50 rounded-2xl p-5 mt-2">
                                    <Users className="text-blue-500 mr-4" size={24} />
                                    <input
                                        type="number" min="1"
                                        value={numPeople}
                                        onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="bg-transparent w-full font-black text-2xl text-gray-800 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Mã khuyến mãi</label>
                                <div className="flex items-center bg-gray-50 rounded-2xl p-5 mt-2 border-2 border-transparent focus-within:border-blue-100 transition-all">
                                    <Tag className="text-blue-500 mr-4" size={24} />
                                    <input
                                        type="text"
                                        className="bg-transparent w-full font-black text-xl text-gray-800 outline-none placeholder:text-gray-300"
                                        placeholder="VÍ DỤ: HE2026"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200">
                                <span className="text-xs font-black uppercase tracking-widest opacity-70">Tổng cộng</span>
                                <p className="text-5xl font-black mt-2">
                                    {new Intl.NumberFormat('vi-VN').format((selectedSchedule?.price || 0) * numPeople)}<span className="text-xl ml-1">₫</span>
                                </p>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={!selectedSchedule}
                                className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all shadow-xl active:scale-95 ${
                                    selectedSchedule
                                        ? 'bg-black text-white hover:bg-blue-700 shadow-blue-100'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {selectedSchedule ? 'XÁC NHẬN ĐẶT TOUR' : 'VUI LÒNG CHỌN NGÀY'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PHẦN TOUR LIÊN QUAN --- */}
            <div className="mt-32 border-t border-gray-100 pt-24">
                <h3 className="text-4xl font-black mb-16 text-center uppercase tracking-tight">Tour tương tự cho bạn</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                    {relatedTours.length > 0 ? (
                        relatedTours.map(t => (
                            <div
                                key={t.tourId}
                                onClick={() => navigate(`/tours/${t.tourId}`)}
                                className="cursor-pointer group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl transition-all border border-gray-50 flex flex-col h-full"
                            >
                                <div className="h-48 rounded-[1.5rem] overflow-hidden mb-6">
                                    <img src={t.imageUrl || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1000'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={t.tourName}/>
                                </div>
                                <h4 className="font-black text-xl text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors mb-3">{t.tourName}</h4>
                                <div className="flex justify-between items-center mt-auto">
                                    <p className="text-blue-600 font-black text-lg">{new Intl.NumberFormat('vi-VN').format(t.basePrice)}đ</p>
                                    <div className="flex items-center text-xs font-black text-yellow-600 bg-yellow-50 px-3 py-1 rounded-xl">
                                        <Star size={12} className="fill-current mr-1"/> {t.averageRating || '0.0'}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-4 text-center text-gray-400 italic">Không tìm thấy tour liên quan phù hợp.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TourDetail;