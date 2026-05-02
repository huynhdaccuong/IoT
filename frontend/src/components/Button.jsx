const Button = ({ 
    type = "button", 
    children, 
    onClick, 
    className = "", 
    variant = "primary", // primary, danger, secondary, brown, beige, success
    fullWidth = true,
    disabled = false
}) => {
    const baseStyles = "px-4 py-2 font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 cursor-pointer";
    const widthClass = fullWidth ? "w-full" : "w-auto inline-block";

    const variants = {
        primary: "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed ",
        danger: "bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed ",
        secondary: "bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed ",
        brown: "bg-[#7A4A2E] hover:bg-[#6B3E25] disabled:bg-[#9B6B47] disabled:cursor-not-allowed ",
        beige: "bg-[#E2C6A6] hover:bg-[#D4AE87] disabled:bg-[#F0D4BA] disabled:cursor-not-allowed ",
        success: "bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed ",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${widthClass} ${baseStyles} ${variants[variant] || variants.primary} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
