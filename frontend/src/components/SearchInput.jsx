import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * SearchInput - Ô tìm kiếm thiết bị
 * @param {String} value - Giá trị search
 * @param {Function} onChange - Callback khi value thay đổi
 * @param {String} placeholder - Placeholder text
 */
const SearchInput = ({ value, onChange, placeholder = "Tìm kiếm" }) => {
    return (
        <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    aria-label="Clear search"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};

export default SearchInput;
