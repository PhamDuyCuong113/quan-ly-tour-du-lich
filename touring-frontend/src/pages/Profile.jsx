import { useEffect, useState } from 'react';
import api from '../api/axios';
import { User, Mail, Phone, Shield, Eye, EyeOff, Save, LogOut, Calendar } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (error) {
                console.error('Cannot load profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        setSaving(true);
        try {
            await api.post('/auth/change-password', passwordForm);
            alert('Đổi mật khẩu thành công!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="mt-4 font-black text-gray-500 uppercase tracking-widest">Đang tải profile...</p>
                </div>
            </div>
        );
    }

    if (!user) return <div className="p-10 text-center text-gray-500 dark:text-slate-400">Không tải được thông tin tài khoản.</div>;

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-5xl">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800">
                <div className="h-40 bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 18%), radial-gradient(circle at 80% 10%, white 0, transparent 14%)' }} />
                </div>

                <div className="px-6 md:px-10 pb-10 -mt-16">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div className="flex items-start gap-5">
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-xl">
                                    <User className="w-12 h-12" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-slate-100 leading-tight">{user.fullName || user.username}</h1>
                                    <p className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-sky-500/15 text-blue-700 dark:text-sky-300 text-xs font-black uppercase tracking-widest">
                                        <Shield size={14} /> {user.role}
                                    </p>
                                    <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
                                        Tài khoản: <span className="font-bold text-gray-700 dark:text-slate-200">{user.username}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900 dark:bg-slate-700 text-white font-black hover:bg-red-600 transition-all">
                                <LogOut size={18} /> Đăng xuất
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <Stat label="Role" value={user.role || '-'} />
                            <Stat label="Loại" value={user.customerType || 'N/A'} />
                            <Stat label="Điểm tích lũy" value={`${user.totalPoints ?? 0} pts`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                            <h2 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-tighter mb-5">Thông tin cơ bản</h2>
                            <div className="space-y-4 text-gray-700 dark:text-slate-200">
                                <InfoRow icon={<User size={18} />} label="Họ tên" value={user.fullName || '-'} />
                                <InfoRow icon={<Mail size={18} />} label="Email" value={user.email || '-'} />
                                <InfoRow icon={<Phone size={18} />} label="Số điện thoại" value={user.phone || '-'} />
                                <InfoRow icon={<Calendar size={18} />} label="Loại khách hàng" value={user.customerType || '-'} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                            <h2 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-tighter mb-5">Đổi mật khẩu</h2>
                            <form className="space-y-4" onSubmit={handleChangePassword}>
                                <PasswordField
                                    label="Mật khẩu hiện tại"
                                    value={passwordForm.currentPassword}
                                    onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })}
                                    show={showPassword}
                                    onToggle={() => setShowPassword(!showPassword)}
                                />
                                <PasswordField
                                    label="Mật khẩu mới"
                                    value={passwordForm.newPassword}
                                    onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })}
                                    show={showPassword}
                                    onToggle={() => setShowPassword(!showPassword)}
                                />
                                <PasswordField
                                    label="Xác nhận mật khẩu mới"
                                    value={passwordForm.confirmPassword}
                                    onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })}
                                    show={showPassword}
                                    onToggle={() => setShowPassword(!showPassword)}
                                />
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all disabled:opacity-60"
                                >
                                    <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Stat = ({ label, value }) => (
    <div className="rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-lg font-black text-gray-900 dark:text-slate-100">{value}</p>
    </div>
);

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 font-bold">
            {icon}
            <span>{label}</span>
        </div>
        <span className="font-black text-gray-900 dark:text-slate-100 text-right">{value}</span>
    </div>
);

const PasswordField = ({ label, value, onChange, show, onToggle }) => (
    <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 ml-2 mb-2">{label}</label>
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-sky-500/40"
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200"
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    </div>
);

export default Profile;
