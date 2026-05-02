import React, { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import deviceService from '../services/deviceService';

const DeviceModal = ({ isOpen, onClose, onSuccess, onError }) => {
    const [deviceCode, setDeviceCode] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await deviceService.addDevice({ device_code: deviceCode, name });
            onSuccess("Thêm thiết bị thành công!");
            setDeviceCode('');
            setName('');
            onClose();
        } catch (error) {
            onError(error.response?.data?.message || "Có lỗi xảy ra khi thêm thiết bị");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5EBE0] bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-all scale-100">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Thêm Thiết Bị Mới</h2>
                
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Mã thiết bị"
                        value={deviceCode}
                        onChange={(e) => setDeviceCode(e.target.value)}
                        placeholder="Nhập mã thiết bị"
                        required
                    />
                    <Input
                        label="Tên thiết bị"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Đặt tên cho thiết bị"
                        required
                    />
                    
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none cursor-pointer"
                        >
                            Hủy
                        </button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Đang thêm...' : 'Thêm thiết bị'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeviceModal;