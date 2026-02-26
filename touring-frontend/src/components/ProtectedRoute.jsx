import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role'); // 'ADMIN' | 'STAFF' | 'USER'

    // 1. Chưa đăng nhập → login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Có yêu cầu role nhưng không đủ quyền → về trang chủ
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;