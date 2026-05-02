import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
            setMessage('Mã đặt lại mật khẩu đã được gửi đến email của bạn.');
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5EBE0] px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Quên Mật Khẩu</h2>
                
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
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all duration-200"
                            placeholder="Nhập địa chỉ email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 bg-[#7A4A2E] hover:bg-[#6B3E25] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#7A4A2E] focus:ring-opacity-75 transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors">
                        Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
