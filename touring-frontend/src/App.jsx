import { Suspense, lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const TourDetail = lazy(() => import('./pages/TourDetail'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminTour = lazy(() => import('./pages/AdminTour'));
const AdminVoucher = lazy(() => import('./pages/AdminVoucher'));
const AdminTourDetail = lazy(() => import('./pages/AdminTourDetail'));
const AdminStaff = lazy(() => import('./pages/AdminStaff'));
const AdminCustomer = lazy(() => import('./pages/AdminCustomer'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminManualBooking = lazy(() => import('./pages/AdminManualBooking.jsx'));

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
                <Suspense fallback={<div className="flex items-center justify-center py-24 text-gray-400 font-bold">Đang tải...</div>}>
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
                            <Route index element={<AdminDashboard />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="tours" element={<AdminTour />} />
                            <Route path="vouchers" element={<AdminVoucher />} />
                            <Route path="tours/:id" element={<AdminTourDetail />} />
                            <Route path="bookings/manual" element={<AdminManualBooking />} />
                            {/* CHỈ ADMIN mới có quyền truy cập 2 trang dưới đây */}
                            <Route path="staffs" element={
                                <ProtectedRoute allowedRoles={['ADMIN']}>
                                    <AdminStaff />
                                </ProtectedRoute>
                            } />
                            <Route path="customers" element={
                                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                                    <AdminCustomer />
                                </ProtectedRoute>
                            } />
                            <Route path="customers/:id" element={
                                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                                    <CustomerDetail />
                                </ProtectedRoute>
                            } />


                        </Route>

                        {/* --- TRANG LỖI 404 --- */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>

            {/* Footer đồng bộ cho toàn trang */}
            <footer className="mt-20 py-10 border-t border-gray-100 text-center text-gray-400 text-sm font-medium">
                &copy; 2026 TOURING APP. Phát triển bởi Cường Phạm. All rights reserved.
            </footer>
        </div>
    );
}

export default App;