import { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };

    return (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white transition-opacity duration-300 ${bgColors[type] || bgColors.info}`}>
            {message}
        </div>
    );
};

export default Toast;
