import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const AddDeviceCard = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center p-6 bg-transparent border-2 border-dashed border-gray-400 rounded-xl hover:border-blue-500 hover:bg-white/50 transition-colors w-full aspect-square focus:outline-none group cursor-pointer"
        >
            <PlusIcon className="h-12 w-12 mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Thêm thiết bị</span>
        </button>
    );
};

export default AddDeviceCard;