import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * DeviceDropdown - Dropdown để chọn thiết bị với search tích hợp
 * @param {Array} devices - Danh sách thiết bị
 * @param {Number} currentDeviceId - ID thiết bị hiện tại
 * @param {Function} onSelect - Callback khi chọn thiết bị
 */
const DeviceDropdown = ({ devices = [], currentDeviceId, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalSearch, setInternalSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const listRef = useRef(null);

    // Filter devices based on internal search
    const filteredDevices = devices.filter(device =>
        device.name.toLowerCase().includes(internalSearch.toLowerCase())
    );

    const currentDevice = devices.find(device => device.id === currentDeviceId);

    // Close dropdown khi click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Reset search when dropdown closes
    useEffect(() => {
        if (!isOpen) {
            setInternalSearch('');
            setSelectedIndex(-1);
        }
    }, [isOpen]);

    const handleSelect = (device) => {
        onSelect(device);
        setIsOpen(false);
        setInternalSearch('');
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredDevices.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && filteredDevices[selectedIndex]) {
                    handleSelect(filteredDevices[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    return (
        <div className="relative w-full" ref={dropdownRef} onKeyDown={handleKeyDown}>
            {/* Button dropdown */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
            >
                <span className="text-sm font-medium text-gray-800 truncate flex-1">
                    {currentDevice ? currentDevice.name : 'Chọn thiết bị'}
                </span>
                <ChevronDownIcon
                    className={`h-5 w-5 text-gray-600 transition-transform duration-200 shrink-0 ml-2 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden">
                    {/* Search Input - Sticky */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={internalSearch}
                                onChange={(e) => {
                                    setInternalSearch(e.target.value);
                                    setSelectedIndex(-1);
                                }}
                                placeholder="Tìm kiếm..."
                                className="w-full pl-9 pr-8 py-2 text-sm text-gray-500 border border-gray-500 rounded focus:outline-none  bg-gray-50 transition-all"
                            />
                            {internalSearch && (
                                <button
                                    onClick={() => {
                                        setInternalSearch('');
                                        setSelectedIndex(-1);
                                    }}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Device List - Max 4 items visible, scroll if more */}
                    {filteredDevices.length > 0 ? (
                        <ul
                            ref={listRef}
                            className="max-h-48 overflow-y-auto"
                        >
                            {filteredDevices.map((device, index) => (
                                <li key={device.id}>
                                    <button
                                        onClick={() => handleSelect(device)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between cursor-pointer ${
                                            currentDeviceId === device.id
                                                ? 'bg-blue-500 text-white font-medium'
                                                : selectedIndex === index
                                                ? 'bg-blue-100 text-gray-800'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="truncate">{device.name}</span>
                                        {currentDeviceId === device.id && (
                                            <CheckIcon className="h-4 w-4 ml-2 shrink-0" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            Không tìm thấy thiết bị
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeviceDropdown;
