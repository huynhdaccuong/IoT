import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Header from "../components/Header";
import DeviceDropdown from "../components/DeviceDropdown";
import ShareModal from "../modal/ShareModal";
import ShareButton from "../components/ShareButton";
import { useAuth } from "../context/AuthContext";
import deviceService from "../services/deviceService"; // Import service
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const { logout } = useAuth();
    const { user } = useAuth(); // Get current user
    const { deviceId } = useParams(); // Get deviceId from URL
    const [currentGas, setCurrentGas] = useState(null);
    const [currentTemp, setCurrentTemp] = useState(null);
    const [currentHumidity, setCurrentHumidity] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [history, setHistory] = useState([]);
    
    // Device & Navigation state
    const [devices, setDevices] = useState([]);
    const [currentDeviceId, setCurrentDeviceId] = useState(null);
    
    // Share Modal state
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    const navigate = useNavigate();

    // Fetch device list
    useEffect(() => {
        const fetchDeviceList = async () => {
            try {
                const list = await deviceService.getAllDevices();
                setDevices(list);
                // Set current device ID from URL parameter
                if (deviceId) {
                    setCurrentDeviceId(parseInt(deviceId));
                } else if (list.length > 0) {
                    setCurrentDeviceId(list[0].id);
                }
            } catch (error) {
                console.error("Failed to load device list", error);
            }
        };
        fetchDeviceList();
    }, []);

    // Update current device ID when URL changes
    useEffect(() => {
        if (deviceId) {
            setCurrentDeviceId(parseInt(deviceId));
        }
    }, [deviceId]);

    const fetchData = useCallback(async () => {
        if (!currentDeviceId) return;
        
        try {
            const currentDevice = devices.find(d => d.id === currentDeviceId);
            if (!currentDevice) return;
            
            const targetCode = currentDevice.device_code;
            
            const currentRes = await fetch(`http://localhost:3000/api/current/${targetCode}`);
            if (!currentRes.ok) throw new Error("Fetch error");
            const currentData = await currentRes.json();
            setCurrentGas(currentData.gas_value); 
            setCurrentTemp(currentData.temperature);
            setCurrentHumidity(currentData.humidity);
            setCurrentLevel(currentData.level);

            // Lấy history
            const historyRes = await fetch(`http://localhost:3000/api/history/${targetCode}`);
            if (!historyRes.ok) throw new Error("Fetch error");
            const historyData = await historyRes.json();
            setHistory(historyData);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [currentDeviceId, devices]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
             navigate('/login');
             return;
        }

        fetchData();
        const interval = setInterval(fetchData, 2000); // refresh mỗi 5 giây
        return () => clearInterval(interval);
    }, [navigate, fetchData]); // Added fetchData to dependency

    const handleDeviceSelect = (device) => {
        setCurrentDeviceId(device.id);
        navigate(`/dashboard/${device.id}`);
    };

    // Get current device info
    const currentDevice = devices.find(device => device.id === currentDeviceId);

    // Prepare chart data
    const getChartData = (label, data, borderColor, backgroundColor) => {
        return {
            labels: history.map(item => new Date(item.created_at).toLocaleTimeString()),
            datasets: [
                {
                    label,
                    data,
                    borderColor,
                    backgroundColor: backgroundColor || "rgba(0, 0, 0, 0.1)",
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: borderColor,
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top",
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                }
            },
            x: {
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                }
            }
        }
    };

    const temperatureChartOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                min: 0,
                max: 200,
                ticks: {
                    stepSize: 20,
                }
            }
        }
    };

    const humidityChartOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 10,
                }
            }
        }
    };

    const gasChartOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                min: 0,
                max: 2000,
                ticks: {
                    stepSize: 100,
                }
            }
        }
    };

    const temperatureData = getChartData(
        "Temperature (°C)",
        history.map(item => item.temperature || 0),
        "#f97316",
        "rgba(249, 115, 22, 0.15)"
    );

    const humidityData = getChartData(
        "Humidity (%)",
        history.map(item => item.humidity || 0),
        "#3b82f6",
        "rgba(59, 130, 246, 0.15)"
    );

    const gasData = getChartData(
        "Gas Value",
        history.map(item => item.gas_value || 0),
        "#dc2626",
        "rgba(220, 38, 38, 0.15)"
    );

    return (
        <div className="min-h-screen bg-[#F5EBE0] font-sans">
            <Header />
            <div className="p-6 md:p-8">
                {/* Realtime Data Grid - Responsive 5 Columns Layout */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                    {/* Temperature Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                        <h2 className="text-base md:text-lg font-semibold text-gray-600 mb-3">Nhiệt độ</h2>
                        <div className="flex items-center justify-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-orange-500">
                                {currentTemp !== null ? `${currentTemp}` : "..."}
                            </h1>
                            <span className="text-xl md:text-2xl font-semibold text-gray-500 ml-2">°C</span>
                        </div>
                    </div>

                    {/* Humidity Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                        <h2 className="text-base md:text-lg font-semibold text-gray-600 mb-3">Độ ẩm</h2>
                        <div className="flex items-center justify-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-blue-500">
                                {currentHumidity !== null ? currentHumidity : "..."}
                            </h1>
                            <span className="text-xl md:text-2xl font-semibold text-gray-500 ml-2">%</span>
                        </div>
                    </div>

                    {/* Gas Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                        <h2 className="text-base md:text-lg font-semibold text-gray-600 mb-3">Mức khí gas</h2>
                        <div className="flex items-center justify-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-red-600">
                                {currentGas !== null ? currentGas : "..."}
                            </h1>
                        </div>
                    </div>

                    {/* Level Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                        <h2 className="text-base md:text-lg font-semibold text-gray-600 mb-3">Mức độ</h2>
                        <div className="flex items-center justify-center">
                            <h1 className="text-xl md:text-xl font-bold text-blue-600">
                                {currentLevel !== null ? currentLevel : "..."}
                            </h1>
                        </div>
                    </div>

                    {/* Controls Container - Share Button + Device Dropdown */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col gap-4 justify-between">
                        {/* Share Button - Top */}
                        {currentDevice && user && user.id === currentDevice.owner_id ? (
                            <ShareButton 
                                isOwner={true}
                                onClick={() => setIsShareModalOpen(true)}
                            />
                        ) : (
                            <div></div>
                        )}

                        {/* Device Dropdown - Bottom */}
                        <DeviceDropdown 
                            devices={devices}
                            currentDeviceId={currentDeviceId}
                            onSelect={handleDeviceSelect}
                        />
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6 mb-8">
                    {/* Temperature Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md" style={{ height: "400px" }}>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Nhiệt độ</h2>
                        {history.length > 0 ? (
                            <div style={{ position: "relative", height: "calc(100% - 40px)" }}>
                                <Line data={temperatureData} options={temperatureChartOptions} />
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Không có dữ liệu</p>
                        )}
                    </div>

                    {/* Humidity Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md" style={{ height: "400px" }}>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Độ ẩm</h2>
                        {history.length > 0 ? (
                            <div style={{ position: "relative", height: "calc(100% - 40px)" }}>
                                <Line data={humidityData} options={humidityChartOptions} />
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Không có dữ liệu</p>
                        )}
                    </div>

                    {/* Gas Value Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md" style={{ height: "400px" }}>
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Mức khí gas</h2>
                        {history.length > 0 ? (
                            <div style={{ position: "relative", height: "calc(100% - 40px)" }}>
                                <Line data={gasData} options={gasChartOptions} />
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Không có dữ liệu</p>
                        )}
                    </div>
                </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                device={currentDevice}
                isOwner={user && currentDevice && user.id === currentDevice.owner_id}
                onShareSuccess={() => {
                    // Optional: refresh device list hoặc update UI nếu cần
                }}
            />
          </div>
        </div>
    );
};

export default Dashboard;
