import React, { useState } from 'react';
import { 
  Home, Package, Users, ShoppingCart, BarChart3, Settings, 
  LogOut, Menu, X, Search, Filter, MapPin, Calendar, 
  DollarSign, Star, ChevronLeft, ChevronRight, User,
  Edit, Trash2, Eye, Plus, Clock, Phone, Mail,
  TrendingUp, UserCheck, Shield, FileText, Award
} from 'lucide-react';

const TravelWebsite = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'Admin User',
    email: 'admin@travel.com',
    role: 'admin', // admin, staff, customer
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=4F46E5&color=fff'
  });

  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tour Data
  const [tours, setTours] = useState([
    {
      id: 1,
      name: 'Hà Nội - Hạ Long - Sapa',
      destination: 'Miền Bắc',
      duration: '5 ngày 4 đêm',
      price: 8500000,
      originalPrice: 10000000,
      capacity: 20,
      booked: 15,
      startDate: '2026-02-15',
      endDate: '2026-02-19',
      status: 'active',
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
      category: 'Adventure',
      highlight: ['Vịnh Hạ Long', 'Fansipan', 'Phố cổ Hà Nội'],
      description: 'Khám phá vẻ đẹp miền Bắc Việt Nam với những cảnh quan thiên nhiên tuyệt đẹp'
    },
    {
      id: 2,
      name: 'Đà Nẵng - Hội An - Huế',
      destination: 'Miền Trung',
      duration: '4 ngày 3 đêm',
      price: 6200000,
      originalPrice: 7500000,
      capacity: 25,
      booked: 20,
      startDate: '2026-02-20',
      endDate: '2026-02-23',
      status: 'active',
      rating: 4.9,
      reviews: 98,
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600',
      category: 'Culture',
      highlight: ['Bà Nà Hills', 'Phố cổ Hội An', 'Đại Nội Huế'],
      description: 'Trải nghiệm văn hóa miền Trung đặc sắc'
    },
    {
      id: 3,
      name: 'Phú Quốc - Nam Du',
      destination: 'Miền Nam',
      duration: '3 ngày 2 đêm',
      price: 5500000,
      originalPrice: 6500000,
      capacity: 30,
      booked: 30,
      startDate: '2026-02-10',
      endDate: '2026-02-12',
      status: 'full',
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=600',
      category: 'Beach',
      highlight: ['Bãi Sao', 'Hòn Thơm', 'Chợ đêm'],
      description: 'Thiên đường biển đảo miền Nam'
    },
    {
      id: 4,
      name: 'Nha Trang - Đà Lạt',
      destination: 'Miền Trung',
      duration: '4 ngày 3 đêm',
      price: 7200000,
      originalPrice: 8500000,
      capacity: 22,
      booked: 18,
      startDate: '2026-03-01',
      endDate: '2026-03-04',
      status: 'active',
      rating: 4.6,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600',
      category: 'Beach',
      highlight: ['Vinpearl Land', 'Thác Datanla', 'Hồ Xuân Hương'],
      description: 'Kết hợp biển xanh và thành phố ngàn hoa'
    },
    {
      id: 5,
      name: 'Mộc Châu - Sơn La',
      destination: 'Miền Bắc',
      duration: '3 ngày 2 đêm',
      price: 4800000,
      originalPrice: 5500000,
      capacity: 18,
      booked: 12,
      startDate: '2026-03-05',
      endDate: '2026-03-07',
      status: 'active',
      rating: 4.5,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600',
      category: 'Nature',
      highlight: ['Đồi chè', 'Thác Dải Yếm', 'Làng văn hóa'],
      description: 'Khám phá cao nguyên xanh mát'
    },
    {
      id: 6,
      name: 'Côn Đảo',
      destination: 'Miền Nam',
      duration: '3 ngày 2 đêm',
      price: 9500000,
      originalPrice: 11000000,
      capacity: 15,
      booked: 10,
      startDate: '2026-03-10',
      endDate: '2026-03-12',
      status: 'active',
      rating: 4.9,
      reviews: 78,
      image: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=600',
      category: 'Beach',
      highlight: ['Lặn biển', 'Nhà tù Côn Đảo', 'Bãi Đầm Trau'],
      description: 'Hòn đảo thiên đường hoang sơ'
    }
  ]);

  // Customers Data
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@email.com', phone: '0901234567', tours: 3, spent: 25000000, joined: '2025-01-15' },
    { id: 2, name: 'Trần Thị B', email: 'thib@email.com', phone: '0912345678', tours: 5, spent: 42000000, joined: '2024-11-20' },
    { id: 3, name: 'Lê Văn C', email: 'vanc@email.com', phone: '0923456789', tours: 2, spent: 15000000, joined: '2025-02-01' },
    { id: 4, name: 'Phạm Thị D', email: 'thid@email.com', phone: '0934567890', tours: 4, spent: 31000000, joined: '2024-12-10' },
  ]);

  // Bookings Data
  const [bookings, setBookings] = useState([
    { id: 1, tourId: 1, customerId: 1, customerName: 'Nguyễn Văn A', tourName: 'Hà Nội - Hạ Long - Sapa', people: 2, total: 17000000, date: '2026-01-20', status: 'confirmed' },
    { id: 2, tourId: 2, customerId: 2, customerName: 'Trần Thị B', tourName: 'Đà Nẵng - Hội An - Huế', people: 3, total: 18600000, date: '2026-01-19', status: 'confirmed' },
    { id: 3, tourId: 3, customerId: 3, customerName: 'Lê Văn C', tourName: 'Phú Quốc - Nam Du', people: 4, total: 22000000, date: '2026-01-18', status: 'pending' },
    { id: 4, tourId: 1, customerId: 4, customerName: 'Phạm Thị D', tourName: 'Hà Nội - Hạ Long - Sapa', people: 2, total: 17000000, date: '2026-01-17', status: 'cancelled' },
  ]);

  // Pagination State
  const [currentTourPage, setCurrentTourPage] = useState(1);
  const toursPerPage = 6;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'tour', 'customer', 'booking'
  const [selectedItem, setSelectedItem] = useState(null);

  // Calculate pagination
  const indexOfLastTour = currentTourPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = tours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(tours.length / toursPerPage);

  // Role-based access control
  const hasPermission = (action) => {
    const permissions = {
      admin: ['view', 'create', 'edit', 'delete', 'manage_users', 'view_reports'],
      staff: ['view', 'create', 'edit'],
      customer: ['view', 'book']
    };
    return permissions[currentUser.role]?.includes(action);
  };

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { id: 'home', label: 'Trang Chủ', icon: Home, roles: ['admin', 'staff', 'customer'] },
      { id: 'tours', label: 'Tour Du Lịch', icon: Package, roles: ['admin', 'staff', 'customer'] },
    ];

    const adminStaffItems = [
      { id: 'bookings', label: 'Đặt Tour', icon: ShoppingCart, roles: ['admin', 'staff'] },
      { id: 'customers', label: 'Khách Hàng', icon: Users, roles: ['admin', 'staff'] },
      { id: 'reports', label: 'Báo Cáo', icon: BarChart3, roles: ['admin'] },
      { id: 'settings', label: 'Cài Đặt', icon: Settings, roles: ['admin'] },
    ];

    const customerItems = [
      { id: 'my-bookings', label: 'Tour Của Tôi', icon: ShoppingCart, roles: ['customer'] },
      { id: 'profile', label: 'Tài Khoản', icon: User, roles: ['customer'] },
    ];

    return [...baseItems, ...adminStaffItems, ...customerItems].filter(item => 
      item.roles.includes(currentUser.role)
    );
  };

  // Render Home Page
  const renderHomePage = () => (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative h-96 rounded-2xl overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200" 
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60 flex items-center">
          <div className="max-w-3xl mx-auto text-center text-white px-6">
            <h1 className="text-5xl font-bold mb-4">Khám Phá Việt Nam Cùng Chúng Tôi</h1>
            <p className="text-xl mb-8">Hơn 100+ tour du lịch trong nước với giá tốt nhất</p>
            <div className="flex gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Xem Tour
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                Liên Hệ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Package className="mb-3 opacity-80" size={32} />
          <div className="text-3xl font-bold mb-1">{tours.length}</div>
          <div className="text-blue-100">Tour Đang Bán</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <Users className="mb-3 opacity-80" size={32} />
          <div className="text-3xl font-bold mb-1">{customers.length}</div>
          <div className="text-green-100">Khách Hàng</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <ShoppingCart className="mb-3 opacity-80" size={32} />
          <div className="text-3xl font-bold mb-1">{bookings.length}</div>
          <div className="text-purple-100">Đơn Đặt Tour</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <TrendingUp className="mb-3 opacity-80" size={32} />
          <div className="text-3xl font-bold mb-1">98%</div>
          <div className="text-orange-100">Hài Lòng</div>
        </div>
      </div>

      {/* Featured Tours */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Tour Nổi Bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tours.slice(0, 3).map(tour => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </div>
  );

  // Tour Card Component
  const TourCard = ({ tour }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all">
      <div className="relative">
        <img src={tour.image} alt={tour.name} className="w-full h-48 object-cover" />
        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          -{Math.round((1 - tour.price / tour.originalPrice) * 100)}%
        </div>
        {tour.status === 'full' && (
          <div className="absolute top-3 left-3 bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Đã Đầy
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin size={16} className="text-blue-500" />
          {tour.destination}
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{tour.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tour.description}</p>
        
        <div className="flex items-center gap-1 mb-3">
          <Star className="text-yellow-400 fill-yellow-400" size={16} />
          <span className="font-semibold">{tour.rating}</span>
          <span className="text-gray-500 text-sm">({tour.reviews} đánh giá)</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Clock size={16} className="text-purple-500" />
          {tour.duration}
        </div>

        <div className="border-t pt-3">
          <div className="flex items-end gap-2 mb-3">
            <span className="text-2xl font-bold text-blue-600">{tour.price.toLocaleString('vi-VN')}đ</span>
            <span className="text-gray-400 line-through text-sm mb-1">{tour.originalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          
          {hasPermission('edit') ? (
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Edit size={16} />
                Sửa
              </button>
              <button className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2">
                <Trash2 size={16} />
                Xóa
              </button>
            </div>
          ) : (
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition">
              Đặt Ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Render Tours Page
  const renderToursPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Danh Sách Tour</h2>
        {hasPermission('create') && (
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center gap-2">
            <Plus size={20} />
            Thêm Tour Mới
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm tour..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Tất cả điểm đến</option>
            <option>Miền Bắc</option>
            <option>Miền Trung</option>
            <option>Miền Nam</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Tất cả danh mục</option>
            <option>Beach</option>
            <option>Culture</option>
            <option>Adventure</option>
            <option>Nature</option>
          </select>
        </div>
      </div>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentTours.map(tour => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentTourPage(prev => Math.max(prev - 1, 1))}
          disabled={currentTourPage === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentTourPage(i + 1)}
            className={`px-4 py-2 rounded-lg ${
              currentTourPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentTourPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentTourPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );

  // Render Bookings Page (Admin/Staff only)
  const renderBookingsPage = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Quản Lý Đặt Tour</h2>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Mã Đơn</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Khách Hàng</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Tour</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Số Người</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Tổng Tiền</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Ngày Đặt</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Trạng Thái</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">#{booking.id}</td>
                <td className="px-6 py-4">{booking.customerName}</td>
                <td className="px-6 py-4">{booking.tourName}</td>
                <td className="px-6 py-4">{booking.people}</td>
                <td className="px-6 py-4 font-semibold text-blue-600">{booking.total.toLocaleString('vi-VN')}đ</td>
                <td className="px-6 py-4">{booking.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status === 'confirmed' ? 'Đã Xác Nhận' :
                     booking.status === 'pending' ? 'Chờ Xử Lý' : 'Đã Hủy'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye size={18} />
                    </button>
                    {hasPermission('edit') && (
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Edit size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Customers Page (Admin/Staff only)
  const renderCustomersPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Quản Lý Khách Hàng</h2>
        {hasPermission('create') && (
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Plus size={20} />
            Thêm Khách Hàng
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {customers.map(customer => (
          <div key={customer.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {customer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{customer.name}</h3>
                <p className="text-sm text-gray-500">Khách hàng #{customer.id}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                {customer.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} />
                {customer.phone}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
              <div>
                <p className="text-gray-500 text-xs">Tour đã đặt</p>
                <p className="font-bold text-lg">{customer.tours}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Tổng chi tiêu</p>
                <p className="font-bold text-lg text-green-600">{(customer.spent / 1000000).toFixed(1)}M</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2">
                <Eye size={16} />
                Chi Tiết
              </button>
              {hasPermission('edit') && (
                <button className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2">
                  <Edit size={16} />
                  Sửa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Reports Page (Admin only)
  const renderReportsPage = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Báo Cáo & Thống Kê</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Doanh Thu Tháng</h3>
            <DollarSign className="text-green-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">156M</p>
          <p className="text-sm text-green-600">+12% so với tháng trước</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Khách Hàng Mới</h3>
            <UserCheck className="text-blue-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">48</p>
          <p className="text-sm text-blue-600">+8% so với tháng trước</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Tỷ Lệ Hài Lòng</h3>
            <Award className="text-purple-500" size={24} />
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-2">98%</p>
          <p className="text-sm text-purple-600">+2% so với tháng trước</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-bold text-xl mb-4">Tour Bán Chạy Nhất</h3>
        <div className="space-y-4">
          {tours.slice(0, 5).map((tour, index) => (
            <div key={tour.id} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <img src={tour.image} alt={tour.name} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <h4 className="font-semibold">{tour.name}</h4>
                <p className="text-sm text-gray-500">{tour.booked} đặt chỗ</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{(tour.price * tour.booked / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-gray-500">Doanh thu</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Page Content
  const renderPageContent = () => {
    if (!hasPermission('view')) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <Shield className="mx-auto mb-4 text-red-500" size={64} />
          <h3 className="text-2xl font-bold text-red-700 mb-2">Không Có Quyền Truy Cập</h3>
          <p className="text-red-600">Bạn không có quyền truy cập trang này.</p>
        </div>
      );
    }

    switch(currentPage) {
      case 'home': return renderHomePage();
      case 'tours': return renderToursPage();
      case 'bookings': return hasPermission('manage_users') || currentUser.role === 'staff' ? renderBookingsPage() : null;
      case 'customers': return hasPermission('manage_users') || currentUser.role === 'staff' ? renderCustomersPage() : null;
      case 'reports': return hasPermission('view_reports') ? renderReportsPage() : null;
      default: return renderHomePage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
            {sidebarOpen && <span className="font-bold text-xl">TravelVN</span>}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {getNavItems().map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    currentPage === item.id
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-800'
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-blue-700">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-semibold text-sm">{currentUser.name}</p>
                <p className="text-xs text-blue-200 capitalize">{currentUser.role}</p>
              </div>
            )}
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-blue-100 hover:bg-blue-800 rounded-lg transition">
            <LogOut size={20} />
            {sidebarOpen && <span>Đăng Xuất</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <Shield size={20} />
                <span className="font-semibold capitalize">{currentUser.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
};

export default TravelWebsite;