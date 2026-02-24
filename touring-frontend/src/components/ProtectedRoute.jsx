import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roleRequired }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); // Chúng ta sẽ lưu role vào đây lúc Login

    // 1. Nếu chưa đăng nhập -> Về trang Login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Nếu yêu cầu quyền ADMIN mà user không phải ADMIN -> Về trang chủ
    if (roleRequired && userRole !== roleRequired) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;