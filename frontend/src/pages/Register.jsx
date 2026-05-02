import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserCircleIcon, EnvelopeIcon, LockClosedIcon, CheckIcon } from '@heroicons/react/24/outline';
import Input from '../components/Input';
import Button from '../components/Button';
import logo from '../assets/logo.png';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Kiểm tra mật khẩu trùng khớp
        if (password !== confirmPassword) {
            setError('Mật khẩu không trùng khớp');
            return;
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        try {
            // Note: Changed endpoint to /api/auth/register
            const response = await axios.post('http://localhost:3000/api/auth/register', {
                name,
                email,
                password,
                confirmPassword
            });
            setSuccess(response.data.message);
            // Có thể thêm điều hướng sau khi đăng ký thành công nếu muốn
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5EBE0]">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Logo" className="h-25 w-auto object-contain" />
                </div>
                {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded">{error}</div>}
                {success && <div className="p-3 mb-4 text-sm text-green-500 bg-green-100 rounded">{success}</div>}
                
                <form onSubmit={handleSubmit} autoComplete="off">
                    <Input
                        label="Tên người dùng"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="off"
                        icon={<UserCircleIcon className="h-5 w-5" />}
                        placeholder="Nhập tên của bạn"
                    />
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
                        placeholder="Tạo mật khẩu"
                    />
                    <Input
                        label="Nhập lại mật khẩu"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        icon={<CheckIcon className="h-5 w-5" />}
                        placeholder="Xác nhận mật khẩu"
                    />
                    <div className="flex items-center justify-between mt-6">
                        <Button type="submit" variant="brown">
                            Đăng Ký
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-center text-gray-500">
                        Đã có tài khoản? <a href="/login" className="text-blue-500 hover:text-blue-700 font-semibold">Đăng nhập</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
