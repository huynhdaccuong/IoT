import React from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';

/**
 * ShareButton - Nút chia sẻ thiết bị
 * @param {Boolean} isOwner - Có phải owner không (disable nếu không phải)
 * @param {Function} onClick - Callback khi click nút share
 * @param {Boolean} isLoading - Trạng thái loading
 */
const ShareButton = ({ isOwner = true, onClick, isLoading = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={!isOwner || isLoading}
            title={!isOwner ? "Chỉ owner mới có thể chia sẻ thiết bị" : "Chia sẻ thiết bị"}
            className={`
                w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200
                ${
                    isOwner && !isLoading
                        ? 'bg-blue-500 hover:bg-blue-600 hover:shadow-md text-white cursor-pointer'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }
                ${isLoading ? 'opacity-70' : ''}
            `}
        >
            <ShareIcon className="h-5 w-5" />
            <span>{isLoading ? 'Đang xử lý...' : 'Chia sẻ'}</span>
        </button>
    );
};

export default ShareButton;
