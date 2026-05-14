// Fallback data dùng khi API chưa có nội dung (giúp Home luôn đẹp).
export const FALLBACK_DESTINATIONS = [
    { destinationId: 'd1', name: 'Đà Nẵng',  region: 'Miền Trung', tourCount: 86, fromPrice: 2990000, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1400' },
    { destinationId: 'd2', name: 'Phú Quốc', region: 'Miền Nam',   tourCount: 64, fromPrice: 3490000, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1400' },
    { destinationId: 'd3', name: 'Đà Lạt',   region: 'Tây Nguyên', tourCount: 52, fromPrice: 1990000, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1400' },
    { destinationId: 'd4', name: 'Nha Trang', region: 'Miền Trung', tourCount: 47, fromPrice: 2490000, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1400' },
    { destinationId: 'd5', name: 'Nhật Bản',  region: 'Châu Á',    tourCount: 38, fromPrice: 18900000, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1400' },
    { destinationId: 'd6', name: 'Hàn Quốc',  region: 'Châu Á',    tourCount: 31, fromPrice: 16900000, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=1400' },
];

export const REVIEWS = [
    { id: 1, name: 'Nguyễn Minh Anh',  city: 'Hà Nội',     avatar: 'https://i.pravatar.cc/120?img=47', rating: 5, content: 'Tour Phú Quốc 4N3Đ tuyệt vời! HDV nhiệt tình, lịch trình hợp lý, khách sạn 5 sao view biển cực đẹp. Sẽ đặt lại lần sau!' },
    { id: 2, name: 'Trần Quốc Bảo',     city: 'TP.HCM',     avatar: 'https://i.pravatar.cc/120?img=12', rating: 5, content: 'Đặt tour Nhật Bản mùa hoa anh đào, dịch vụ chuyên nghiệp từ A đến Z. Cảm ơn Touring đã cho gia đình mình một kỷ niệm đáng nhớ.' },
    { id: 3, name: 'Lê Phương Thảo',    city: 'Đà Nẵng',    avatar: 'https://i.pravatar.cc/120?img=32', rating: 5, content: 'Giá tốt nhất thị trường, app dễ dùng, thanh toán an toàn. Tour Đà Lạt mùa hoa rất chill, đáng đồng tiền bát gạo!' },
    { id: 4, name: 'Phạm Hoàng Long',   city: 'Hải Phòng',  avatar: 'https://i.pravatar.cc/120?img=15', rating: 5, content: 'Hỗ trợ 24/7 thật sự, mình hỏi nửa đêm vẫn có người trả lời. Trải nghiệm đặt tour mượt mà nhất từng dùng.' },
];

export const WHY_US = [
    { icon: 'BadgePercent', title: 'Giá tốt nhất',         desc: 'Cam kết hoàn tiền nếu bạn tìm được giá rẻ hơn ở nơi khác trong vòng 24h.' },
    { icon: 'Headphones',   title: 'Hỗ trợ 24/7',          desc: 'Đội ngũ tư vấn viên chuyên nghiệp luôn sẵn sàng trợ giúp mọi lúc, mọi nơi.' },
    { icon: 'ShieldCheck',  title: 'Thanh toán an toàn',   desc: 'Giao dịch được mã hoá SSL 256-bit, hỗ trợ thẻ quốc tế, ví điện tử, QR Pay.' },
    { icon: 'Sparkles',     title: 'Tour chất lượng',      desc: 'Hơn 10.000 tour được kiểm duyệt kỹ, đối tác uy tín, đánh giá thực từ khách.' },
];
