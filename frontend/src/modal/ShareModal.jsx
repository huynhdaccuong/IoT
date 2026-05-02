import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import SharedUserList from '../components/SharedUserList';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import deviceService from '../services/deviceService';

/**
 * ShareModal - Modal chia sẻ thiết bị
 * @param {Boolean} isOpen - Trạng thái mở/đóng modal
 * @param {Function} onClose - Callback khi đóng modal
 * @param {Object} device - Thông tin thiết bị hiện tại
 * @param {Boolean} isOwner - User có phải owner không
 * @param {Function} onShareSuccess - Callback khi chia sẻ thành công
 */
const ShareModal = ({ isOpen, onClose, device, isOwner = false, onShareSuccess }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSharedUsers, setIsLoadingSharedUsers] = useState(false);
    const [sharedUsers, setSharedUsers] = useState([]);
    const [toast, setToast] = useState(null);
    const [removeConfirm, setRemoveConfirm] = useState({ show: false, userId: null, userName: '' });
    const [isRemoving, setIsRemoving] = useState(false);

    // Fetch danh sách user đã được chia sẻ khi modal mở
    useEffect(() => {
        if (isOpen && device && isOwner) {
            fetchSharedUsers();
        }
    }, [isOpen, device, isOwner]);

    const fetchSharedUsers = async () => {
        if (!device?.id) return;

        setIsLoadingSharedUsers(true);
        try {
            const response = await deviceService.getSharedUsers(device.id);
            setSharedUsers(response.data || []);
        } catch (error) {
            console.error('Lỗi lấy danh sách chia sẻ:', error);
            setToast({
                type: 'error',
                message: 'Không thể tải danh sách chia sẻ'
            });
        } finally {
            setIsLoadingSharedUsers(false);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setToast({
                type: 'error',
                message: 'Vui lòng nhập email'
            });
            return;
        }

        if (!device?.id) {
            setToast({
                type: 'error',
                message: 'Không tìm thấy thiết bị'
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await deviceService.shareDevice(device.id, { email });

            setToast({
                type: 'success',
                message: response.message || 'Chia sẻ thiết bị thành công'
            });

            setEmail('');
            
            // Tải lại danh sách user đã share
            await fetchSharedUsers();

            // Gọi callback nếu có
            if (onShareSuccess) {
                onShareSuccess();
            }
        } catch (error) {
            console.error('Lỗi chia sẻ:', error);
            
            const errorMessage = error.response?.data?.message || 'Lỗi chia sẻ thiết bị';
            setToast({
                type: 'error',
                message: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveShare = (userId) => {
        if (!device?.id || !userId) return;

        // Lấy thông tin user từ danh sách shared users
        const user = sharedUsers.find(u => u.user_id === userId);
        if (user) {
            setRemoveConfirm({
                show: true,
                userId: userId,
                userName: user.name || user.email
            });
        }
    };

    const handleConfirmRemove = async () => {
        const userId = removeConfirm.userId;

        setIsRemoving(true);
        try {
            await deviceService.removeSharedUser(device.id, userId);

            setToast({
                type: 'success',
                message: 'Đã xóa quyền truy cập'
            });

            // Cập nhật danh sách
            await fetchSharedUsers();
            setRemoveConfirm({ show: false, userId: null, userName: '' });
        } catch (error) {
            console.error('Lỗi xóa chia sẻ:', error);
            setToast({
                type: 'error',
                message: 'Không thể xóa chia sẻ'
            });
        } finally {
            setIsRemoving(false);
        }
    };

    const handleCancelRemove = () => {
        setRemoveConfirm({ show: false, userId: null, userName: '' });
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-[#F5EBE0] bg-opacity-50 z-40"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 flex items-center justify-between p-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl z-10">
                        <div>
                            <h2 className="text-xl font-bold">Chia sẻ thiết bị</h2>
                            <p className="text-sm text-blue-100 mt-1">
                                {device?.name || 'Thiết bị'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-blue-700 rounded transition-colors cursor-pointer"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5">
                        {/* Thông báo của owner */}
                        {isOwner ? (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Bạn là chủ thiết bị</strong> - Có thể chia sẻ với tối đa <strong>3 người</strong>
                                </p>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    Bạn không phải chủ thiết bị, chỉ có thể xem danh sách chia sẻ
                                </p>
                            </div>
                        )}

                        {/* Form chia sẻ (chỉ hiển thị nếu owner) */}
                        {isOwner && (
                            <form onSubmit={handleShare} className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Email người nhận:
                                </label>
                                <div className="w-full">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Nhập email người nhận"
                                        disabled={isLoading}
                                        className="flex-1"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !email.trim()}
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg
                                                className="animate-spin h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth={4}
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Đang gửi...
                                        </span>
                                    ) : (
                                        'Chia sẻ'
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* Danh sách user đã chia sẻ */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Danh sách người được chia sẻ:
                                <span className="ml-1 text-gray-500">
                                    ({isLoadingSharedUsers ? 'Đang tải...' : sharedUsers.length})
                                </span>
                            </label>
                            {isLoadingSharedUsers ? (
                                <div className="flex justify-center py-4">
                                    <svg
                                        className="animate-spin h-5 w-5 text-blue-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth={4}
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                </div>
                            ) : (
                                <SharedUserList
                                    sharedUsers={sharedUsers}
                                    onRemove={isOwner ? handleRemoveShare : null}
                                    isOwner={isOwner}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast notification */}
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={removeConfirm.show}
                onConfirm={handleConfirmRemove}
                onCancel={handleCancelRemove}
                itemName={removeConfirm.userName}
                isLoading={isRemoving}
                title="Xóa quyền truy cập"
                message="Bạn có chắc chắn muốn xóa quyền truy cập của người dùng"
                itemType="người dùng"
                confirmButtonText="Xóa"
                cancelButtonText="Hủy"
            />
        </>
    );
};

export default ShareModal;
