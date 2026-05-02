import { useNavigate, Link, useLocation } from 'react-router-dom';
import { HomeIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png'; 

const Header = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/profile');
    };

    return (
        <header className="relative flex items-center justify-between px-6 py-4 bg-white text-gray-800 shadow-md w-full">
            {/* Left: Home Link with Icon (hidden on home page) */}
            {!isHomePage && (
                <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <HomeIcon className="h-6 w-6" />
                </Link>
            )}
            {isHomePage && <div className="w-16" />}

            {/* Center: Logo (Absolutely Centered) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
            </div>

            {/* Right: Profile & Logout Buttons (Icons Only) */}
            <div className="flex items-center gap-2 ml-auto">
                {/* Profile Button */}
                <button 
                    onClick={handleProfile} 
                    className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group cursor-pointer"
                    title="Hồ sơ cá nhân"
                >
                    <UserCircleIcon className="h-6 w-6" />
                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                        Hồ sơ
                    </span>
                </button>

                {/* Logout Button */}
                <button 
                    onClick={handleLogout} 
                    className="relative p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 group cursor-pointer"
                    title="Đăng xuất"
                >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                        Đăng xuất
                    </span>
                </button>
            </div>
        </header>
    );
};

export default Header;
