import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/Button';

const EmailVerified = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const [title, setTitle] = useState('Verifying...');
    const [description, setDescription] = useState('');
    const [iconColor, setIconColor] = useState('text-gray-500');

    useEffect(() => {
        if (status === 'success') {
            setTitle('Email Verified Successfully');
            setDescription('Tài khoản của bạn đã được xác thực thành công.');
            setIconColor('text-green-500');
        } else {
            setTitle('Verification Failed');
            setDescription(message || 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
            setIconColor('text-red-500');
        }
    }, [status, message]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5EBE0]">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <div className={`mb-4 flex justify-center ${iconColor}`}>
                    {status === 'success' ? (
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ) : (
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
                <p className="text-gray-600 mb-6">{description}</p>
                
                <Button 
                    onClick={() => navigate('/login')}
                >
                    Go to Login
                </Button>
            </div>
        </div>
    );
};

export default EmailVerified;
