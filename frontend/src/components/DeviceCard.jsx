import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, ComputerDesktopIcon, PencilIcon } from '@heroicons/react/24/outline';

const DeviceCard = ({ device, onDelete, onRename }) => {
    const navigate = useNavigate();

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(device.id);
        }
    };

    const handleRename = (e) => {
        e.stopPropagation();
        if (onRename) {
            onRename(device);
        }
    };

    return (
        <div className="group relative w-full aspect-square">
            {/* Delete Button */}
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute top-3 left-3 z-10 p-2 text-red-500 hover:text-red-700 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Xóa thiết bị"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            )}

            {/* Rename Button */}
            {onRename && (
                <button
                    onClick={handleRename}
                    className="absolute top-3 right-3 z-10 p-2 text-blue-500 hover:text-blue-700 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Đổi tên thiết bị"
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
            )}

            {/* Device Card */}
            <button
                onClick={() => navigate(`/dashboard/${device.id}`)}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 w-full h-full border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
                <ComputerDesktopIcon className="h-16 w-16 mb-4 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-800 text-center line-clamp-2">{device.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{device.device_code}</p>
            </button>
        </div>
    );
};

export default DeviceCard;