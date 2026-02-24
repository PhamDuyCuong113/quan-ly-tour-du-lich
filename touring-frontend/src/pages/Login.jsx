import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { username, password });

            // LƯU CẢ TOKEN VÀ ROLE
            localStorage.setItem('token', response.data.accessToken);

            // Giải mã role từ thông tin trả về hoặc gọi API /me để lấy role
            // Ở đây mình giả định bạn lấy role từ API /me ngay sau khi login
            const userRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${response.data.accessToken}` }
            });
            localStorage.setItem('role', userRes.data.role);

            alert("Đăng nhập thành công!");
            window.location.href = userRes.data.role === 'ADMIN' ? '/admin' : '/';
        } catch (error) {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Đăng Nhập</h2>
                <input
                    type="text" placeholder="Username"
                    className="w-full p-2 mb-4 border rounded"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password" placeholder="Password"
                    className="w-full p-2 mb-4 border rounded"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Gửi
                </button>
            </form>
        </div>
    );
};

export default Login;