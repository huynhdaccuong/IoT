import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../modal/EditProfileModal';
import Toast from '../components/Toast';
import Button from '../components/Button';
import Header from '../components/Header';

const Profile = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const closeToast = () => {
        setToast({ show: false, message: '', type: 'info' });
    };

    if (!user) {
        return (
            <div className="flex flex-col min-h-screen bg-[#F5EBE0] text-gray-800">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-600">Vui lòng đăng nhập để xem thông tin.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5EBE0]">
            <Header />
            <div className="p-8 flex justify-center">
                {toast.show && (
                    <Toast 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={closeToast} 
                    />
                )}

                <div className="w-full max-w-2xl bg-white rounded-xl shadow-md overflow-hidden mt-10 h-fit">
                    {/* Header/Cover */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
                    
                    <div className="px-8 pb-8">
                        {/* Avatar */}
                        <div className="relative -mt-16 mb-6">
                            <div className="w-32 h-32 bg-gray-100 rounded-full border-4 border-white flex items-center justify-center text-4xl text-gray-400 overflow-hidden shadow-md">
                                {/* Placeholder Avatar */}
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="uppercase font-bold">{user.name?.charAt(0) || "U"}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-1">{user.name}</h1>
                                <p className="text-gray-600">{user.email}</p>
                                <div className="mt-2 text-sm text-gray-500">
                                    Member since: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => setIsModalOpen(true)}
                                variant="primary"
                                className="w-auto px-6 "
                            >
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>

                <EditProfileModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={(msg) => showToast(msg, 'success')}
                    onError={(msg) => showToast(msg, 'error')} 
                />
            </div>
        </div>
    );
};

export default Profile;
