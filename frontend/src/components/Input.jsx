import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Input = ({ 
    type = "text", 
    label, 
    value, 
    onChange, 
    placeholder, 
    required = false, 
    autoComplete,
    icon 
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

    return (
        <div className="mb-4">
            {label && (
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    type={inputType}
                    className={`w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-500 ${icon ? 'pl-10' : ''} ${isPasswordField ? 'pr-10' : ''}`}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={autoComplete}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                            <EyeIcon className="h-5 w-5" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Input;
