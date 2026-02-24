import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import TourDetail from './pages/TourDetail';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute'; // IMPORT CÁI NÀY

function App() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
            {/* 1. Navbar hiển thị trên mọi trang */}
            <Navbar />

            {/* 2. Nội dung các trang thay đổi theo URL */}
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/tours/:id" element={<TourDetail />} />
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/profile" element={<Profile />} />

                    {/* TRANG ADMIN ĐÃ ĐƯỢC BẢO VỆ */}
                    <Route path="/admin" element={
                        <ProtectedRoute roleRequired="ADMIN">
                            <Admin />
                        </ProtectedRoute>
                    } />

                    {/* Trang 404 (Khi gõ sai URL) */}
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
                &copy; 2026 TOURING. Thiết kế bởi Cường Phạm. Chúc bạn có những chuyến đi tuyệt vời!
            </footer>
        </div>
    );
}

export default App;