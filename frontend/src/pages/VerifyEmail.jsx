import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [message, setMessage] = useState('Đang xác thực...');
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setMessage('Token không hợp lệ');
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                // Confirm using uniform API endpoint /api/auth
                await axios.get(`http://localhost:3000/api/auth/verify?token=${token}`);
                setMessage('Xác thực email thành công! Đang chuyển hướng đến trang đăng nhập...');
                setStatus('success');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error) {
                setMessage(error.response?.data?.message || 'Xác thực thất bại');
                setStatus('error');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className={`p-8 rounded shadow-md text-center ${status === 'success' ? 'bg-green-800' : status === 'error' ? 'bg-red-800' : 'bg-gray-800'}`}>
                <h2 className="text-2xl font-bold mb-4">Xác thực Email</h2>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default VerifyEmail;
