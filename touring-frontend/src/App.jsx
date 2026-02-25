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

function App() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
            <Navbar />
            <main>
                <Routes>
                    {/* --- PUBLIC ROUTES --- */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/tours/:id" element={<TourDetail />} />

                    {/* --- CUSTOMER ROUTES (Cần Login) --- */}
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/profile" element={<Profile />} />

                    {/* --- ADMIN ROUTES (Cần Role ADMIN + Có Sidebar) --- */}
                    <Route path="/admin" element={
                        <ProtectedRoute roleRequired="ADMIN">
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminTour />} />
                        <Route path="tours" element={<AdminTour />} />
                        <Route path="vouchers" element={<AdminVoucher />} />

                        {/* ĐƯA VÀO ĐÂY: Để trang edit vẫn hiện Sidebar và được bảo vệ */}
                        <Route path="tours/:id" element={<AdminTourDetail />} />
                    </Route>

                    {/* --- 404 NOT FOUND --- */}
                    <Route path="*" element={
                        <div className="flex flex-col items-center justify-center h-[70vh]">
                            <h1 className="text-9xl font-black text-gray-200">404</h1>
                            <p className="text-xl text-gray-500 -mt-8 font-medium">Trang bạn tìm không tồn tại!</p>
                            <Link to="/" className="mt-6 text-blue-600 font-bold hover:underline">Quay lại trang chủ</Link>
                        </div>
                    } />
                </Routes>
            </main>
            <footer className="mt-20 py-10 border-t border-gray-100 text-center text-gray-400 text-sm">
                &copy; 2026 TOURING. Thiết kế bởi Cường Phạm.
            </footer>
        </div>
    );
}

export default App;