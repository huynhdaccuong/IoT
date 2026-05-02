import React from 'react';

/**
 * SharedUserList - Hiển thị danh sách user đã được chia sẻ thiết bị
 * @param {Array} sharedUsers - Danh sách user đã được chia sẻ
 * @param {Function} onRemove - Callback khi xóa user khỏi danh sách share
 * @param {Boolean} isOwner - Có phải owner không (chỉ owner mới có thể xóa)
 */
const SharedUserList = ({ sharedUsers = [], onRemove, isOwner = false }) => {
    if (!sharedUsers || sharedUsers.length === 0) {
        return (
            <div className="py-3 px-4 text-center text-gray-500 text-sm">
                Chưa thêm ai được chia sẻ
            </div>
        );
    }

    return (
        <div className="max-h-64 overflow-y-auto">
            <div className="space-y-2 px-4 py-3">
                {sharedUsers.map((user) => (
                    <div
                        key={user.user_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user.name || user.email}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user.email}
                            </p>
                            {user.created_at && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Shared: {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                </p>
                            )}
                        </div>

                        {isOwner && onRemove && (
                            <button
                                onClick={() => onRemove(user.user_id)}
                                className="ml-2 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer\"
                                title="Xóa quyền truy cập"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SharedUserList;
