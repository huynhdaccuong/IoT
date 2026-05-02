import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import DeviceCard from '../components/DeviceCard';
import AddDeviceCard from '../components/AddDeviceCard';
import DeviceModal from '../modal/DeviceModal';
import RenameDeviceModal from '../modal/RenameDeviceModal';
import ConfirmDeleteModal from '../modal/ConfirmDeleteModal';
import Toast from '../components/Toast';
import deviceService from '../services/deviceService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const [devices, setDevices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [selectedDeviceForRename, setSelectedDeviceForRename] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeviceForDelete, setSelectedDeviceForDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const navigate = useNavigate();

    const fetchDevices = async () => {
        const token = localStorage.getItem('token');
        
        // Kiểm tra token trước khi gọi API
        if (!token) {
            console.warn("No token found, redirecting to login");
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            // Gọi API qua deviceService (đã dùng axiosClient có token)
            // axiosClient interceptor đã trả về response.data, 
            // nhưng nếu backend trả về mảng trực tiếp thì data là mảng
            const data = await deviceService.getAllDevices();
            
            // Kiểm tra kiểu dữ liệu trả về để set state đúng
            if (Array.isArray(data)) {
                setDevices(data);
            } else {
                console.error("Data received is not an array:", data);
                setDevices([]); 
            }
        } catch (error) {
            console.error("Failed to fetch devices", error);
            showToast("Không thể tải danh sách thiết bị. Vui lòng thử lại.", 'error');
            
            // Nếu lỗi 401 axiosClient đã redirect, nhưng check thêm cho chắc
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteDevice = (deviceId) => {
        const device = devices.find(d => d.id === deviceId);
        setSelectedDeviceForDelete(device);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDeviceForDelete) return;

        setIsDeleting(true);
        try {
            await deviceService.deleteDevice(selectedDeviceForDelete.id);
            showToast("Xóa thiết bị thành công!", 'success');
            setDevices(devices.filter(d => d.id !== selectedDeviceForDelete.id));
            setIsDeleteModalOpen(false);
            setSelectedDeviceForDelete(null);
        } catch (error) {
            const msg = error.response?.data?.message || "Không thể xóa thiết bị. Vui lòng thử lại.";
            showToast(msg, 'error');
            console.error("Failed to delete device", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setSelectedDeviceForDelete(null);
    };

    const openRenameModal = (device) => {
        setSelectedDeviceForRename(device);
        setIsRenameModalOpen(true);
    };

    const handleRenameSuccess = (msg) => {
        showToast(msg, 'success');
        setIsRenameModalOpen(false);
        setSelectedDeviceForRename(null);
        fetchDevices(); // Reload list after rename
    };

    const handleRenameError = (msg) => {
        showToast(msg, 'error');
    };

    useEffect(() => {
        fetchDevices();
    }, [navigate]); // Re-run if navigate changes (rare) or component mounts

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleAddSuccess = (msg) => {
        showToast(msg, 'success');
        fetchDevices(); // Reload list after add
    };

    return (
        <div className="min-h-screen bg-[#F5EBE0] text-gray-800 flex flex-col">
            <Header />
            
            {toast.show && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ ...toast, show: false })} 
                />
            )}

            <div className="flex-grow p-7 container mx-auto">
                {/* <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Danh sách thiết bị</h1>
                        <p className="text-gray-600 mt-2">Quản lý và giám sát các thiết bị IoT của bạn</p>
                    </div>
                </div> */}

                {loading ? (
                    <div className="text-center py-20 text-gray-400 animate-pulse">Đang tải dữ liệu...</div>
                ) : devices.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 mb-4">Bạn chưa có thiết bị nào</p>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                            Thêm thiết bị mới
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                        {devices.map((device) => (
                            <DeviceCard 
                                key={device.id} 
                                device={device} 
                                onDelete={deleteDevice}
                                onRename={user?.id === device.owner_id ? openRenameModal : null}
                            />
                        ))}
                        <AddDeviceCard onClick={() => setIsModalOpen(true)} />
                    </div>
                )}
            </div>

            <DeviceModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAddSuccess}
                onError={(msg) => showToast(msg, 'error')}
            />

            <RenameDeviceModal
                isOpen={isRenameModalOpen}
                onClose={() => {
                    setIsRenameModalOpen(false);
                    setSelectedDeviceForRename(null);
                }}
                device={selectedDeviceForRename}
                onSuccess={handleRenameSuccess}
                onError={handleRenameError}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                itemName={selectedDeviceForDelete?.name || ''}
                isLoading={isDeleting}
                title="Xóa thiết bị"
                message="Bạn có chắc chắn muốn xóa"
                confirmButtonText="Xóa"
                cancelButtonText="Hủy"
            />
        </div>
    );
};

export default Home;
