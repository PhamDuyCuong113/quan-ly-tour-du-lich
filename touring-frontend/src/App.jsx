import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import TourDetail from './pages/TourDetail';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminTour from './pages/AdminTour';
import AdminVoucher from './pages/AdminVoucher';
import AdminTourDetail from './pages/AdminTourDetail';
import AdminStaff from "./pages/AdminStaff";
import AdminCustomer from "./pages/AdminCustomer";
// Component hiển thị khi gõ sai URL
const NotFound = () => (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <h1 className="text-9xl font-black text-gray-200">404</h1>
        <p className="text-2xl font-bold text-gray-800 -mt-8 mb-4">Ối! Trang này không tồn tại</p>
        <p className="text-gray-500 mb-8">Có vẻ như đường dẫn bạn truy cập đã bị xóa hoặc chưa từng tồn tại.</p>
        <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-black transition-all">
            Quay lại trang chủ
        </Link>
    </div>
);

function App() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
            {/* 1. Thanh điều hướng chung cho toàn bộ website */}
            <Navbar />

            <main>
                <Routes>
                    {/* --- CÁC TRANG CÔNG KHAI (AI CŨNG XEM ĐƯỢC) --- */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/tours/:id" element={<TourDetail />} />

                    {/* --- CÁC TRANG DÀNH CHO KHÁCH HÀNG (CẦN ĐĂNG NHẬP) --- */}
                    <Route path="/my-bookings" element={
                        <ProtectedRoute>
                            <MyBookings />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />

                    {/* --- HỆ THỐNG QUẢN TRỊ (PHÂN QUYỀN ADMIN & STAFF) --- */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        {/* Mặc định khi vào /admin sẽ hiện trang quản lý tour */}
                        <Route index element={<AdminTour />} />
                        <Route path="tours" element={<AdminTour />} />
                        <Route path="vouchers" element={<AdminVoucher />} />
                        <Route path="tours/:id" element={<AdminTourDetail />} />

                        {/* CHỈ ADMIN mới có quyền truy cập 2 trang dưới đây */}
                        <Route path="staffs" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminStaff />
                            </ProtectedRoute>
                        } />
                        <Route path="customers" element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AdminCustomer />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* --- TRANG LỖI 404 --- */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            {/* Footer đồng bộ cho toàn trang */}
            <footer className="mt-20 py-10 border-t border-gray-100 text-center text-gray-400 text-sm font-medium">
                &copy; 2026 TOURING APP. Phát triển bởi Cường Phạm. All rights reserved.
            </footer>
        </div>
    );
}

export default App;