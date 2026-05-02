import { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu không khớp.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);

        try {
            await axios.post('http://localhost:3000/api/auth/reset-password', {
                token,
                newPassword,
                confirmPassword
            });
            setMessage('Mật khẩu đã được đặt lại thành công.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi Xác Thực</h2>
                    <p className="text-gray-600 mb-6">Token đặt lại mật khẩu không hợp lệ hoặc bị thiếu.</p>
                    <Link to="/forgot-password" className="text-blue-500 hover:text-blue-700 underline font-medium transition-colors">
                        Yêu cầu lại
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5EBE0] px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Đặt Lại Mật Khẩu</h2>
                
                {message && (
                    <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg border border-green-300" role="alert">
                        {message}
                    </div>
                )}
                
                {error && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 bg-[#7A4A2E] hover:bg-[#6B3E25] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#7A4A2E] focus:ring-opacity-75 transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đặt lại Mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;