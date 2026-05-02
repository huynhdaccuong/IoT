import { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import deviceService from '../services/deviceService';

const RenameDeviceModal = ({ isOpen, onClose, device, onSuccess, onError }) => {
    const [deviceName, setDeviceName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (device) {
            setDeviceName(device.name || '');
        }
    }, [device, isOpen]);

    if (!isOpen || !device) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!deviceName || deviceName.trim().length < 1) {
                throw new Error("Tên thiết bị không được để trống");
            }

            if (deviceName.trim().length > 50) {
                throw new Error("Tên thiết bị không được vượt quá 50 ký tự");
            }

            // Nếu tên không thay đổi thì không cần gọi API
            if (deviceName === device.name) {
                onClose();
                return;
            }

            // Gọi API cập nhật
            await deviceService.updateDevice(device.id, { name: deviceName.trim() });
            onSuccess("Cập nhật tên thiết bị thành công!");
            onClose();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra";
            onError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5EBE0] bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Đổi tên thiết bị</h2>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Tên thiết bị"
                        type="text"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder="Nhập tên thiết bị"
                        required
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="success"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            disabled={loading}
                        >
                            {loading ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RenameDeviceModal;
