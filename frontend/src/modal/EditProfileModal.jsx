import { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import userService from '../services/userService';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose, onSuccess, onError }) => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Password fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!name || name.trim().length < 2) {
                throw new Error("Tên phải có ít nhất 2 ký tự");
            }

            let profileUpdated = false;
            let passwordUpdated = false;

            // 1. Update Profile (Name)
            if (name !== user.name) {
                const updateData = { name };
                await userService.updateMe(updateData);
                updateUser({ name }); // Update local context
                profileUpdated = true;
            }

            // 2. Change Password
            if (newPassword) {
                if (newPassword.length < 6) {
                    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
                }
                if (newPassword !== confirmPassword) {
                    throw new Error("Mật khẩu xác nhận không khớp");
                }
                if (!currentPassword) {
                    throw new Error("Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu");
                }

                await authService.changePassword({
                    currentPassword,
                    newPassword,
                    confirmPassword
                });
                passwordUpdated = true;
            }

            // Success handling
            if (profileUpdated || passwordUpdated) {
                onSuccess("Cập nhật thông tin thành công!");
                // Reset password fields
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                onClose();
            } else {
                // No changes made
                onClose();
            }

        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra";
            onError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className=" fixed inset-0 z-50 flex items-center justify-center bg-[#F5EBE0] bg-opacity-50">
            <div className="bg-[#ffffff] rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <form onSubmit={handleSubmit}>
                    {/* Read-only Email */}
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full px-4 py-2 text-gray-500 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed transition-colors"
                        />
                    </div>

                    <Input
                        label="Tên"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <h3 className="text-md font-semibold text-gray-800 mb-4">Đổi mật khẩu</h3>

                    <Input
                        label="Mật khẩu hiện tại"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />

                    <Input
                        label="Mật khẩu mới"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <Input
                        label="Xác nhận mật khẩu mới"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <div className="flex justify-end mt-2 mb-4">
                        <a href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700">
                            Quên mật khẩu hiện tại ?
                        </a>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="success" 
                            onClick={onClose}
                            className="w-auto"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit" 
                            variant="danger"
                            className="w-auto"
                            disabled={loading}
                        >
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
