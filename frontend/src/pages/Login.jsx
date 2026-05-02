import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Note: Updated endpoint to /api/auth/login for reliability
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password
            });
            
            // 1. Lấy token từ response
            const { token, user } = response.data;

            // 2. Debug log
            console.log("Login Success. Token:", token ? "Received" : "Missing");

            // 3. Lưu token vào localStorage QUAN TRỌNG
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // 4. Update Context
            login(user, token);

            // Check if user has a device_id
            if (!user.device_id) {
                // If no device_id, redirect to profile or settings to add it
                // Or just go home because home now has "Add Device" feature
                navigate('/'); 
            } else {
                // Chuyển hướng đến trang chính if device exists
                navigate('/'); 
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Sai email hoặc mật khẩu');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5EBE0]">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Logo" className="h-32 w-auto object-contain" />
                </div>
                {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded">{error}</div>}
                
                <form onSubmit={handleSubmit} autoComplete="off">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="off"
                        icon={<EnvelopeIcon className="h-5 w-5" />}
                        placeholder="Nhập email của bạn"
                    />
                    <Input
                        label="Mật khẩu"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        icon={<LockClosedIcon className="h-5 w-5" />}
                        placeholder="Nhập mật khẩu"
                    />
                    
                    <div className="flex justify-end mt-2">
                        <a href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700">
                            Quên mật khẩu?
                        </a>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <Button type="submit" variant="brown">
                            Đăng Nhập
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-center text-gray-500">
                        Chưa có tài khoản? <a href="/register" className="text-blue-500 hover:text-blue-700 font-semibold">Đăng ký</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
