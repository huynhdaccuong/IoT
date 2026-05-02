import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmDeleteModal = ({
    isOpen,
    onConfirm,
    onCancel,
    itemName,
    isLoading,
    title = 'Xóa thiết bị',
    message = 'Bạn có chắc chắn muốn xóa',
    itemType = 'thiết bị',
    confirmButtonText = 'Xóa',
    cancelButtonText = 'Hủy'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#F5EBE0] bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 animate-fadeIn">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-center text-gray-600 mb-6">
                    {message} <span className="font-semibold">"{itemName}"</span>?
                    <br />
                    <span className="text-sm text-gray-500">Hành động này không thể hoàn tác.</span>
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {cancelButtonText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang xóa...
                            </>
                        ) : (
                            confirmButtonText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
