const db = require("../config/db");
const { sendAlertEmail } = require("../utils/emailService");

// Lưu trạng thái level trước đó của mỗi device (để tránh spam email)
// Format: { device_id: "previous_level" }
const deviceLevelStatus = {};

/**
 * Kiểm tra và gửi cảnh báo nếu cần
 * @param {Object} data - Dữ liệu sensor từ database
 * @param {string} data.device_id - ID thiết bị
 * @param {number} data.gas_value - Giá trị khí gas
 * @param {number} data.temperature - Nhiệt độ
 * @param {number} data.humidity - Độ ẩm
 * @param {string} data.level - Mức cảnh báo (SAFE, WARNING, DANGER)
 * @param {string} data.updated_at - Thời gian cập nhật
 */
const checkAndSendAlert = async (data) => {
    try {
        const deviceId = data.device_id;
        const currentLevel = data.level;
        const previousLevel = deviceLevelStatus[deviceId] || "SAFE";

        // Lưu trạng thái hiện tại
        deviceLevelStatus[deviceId] = currentLevel;

        // Chỉ gửi cảnh báo nếu:
        // 1. Level thay đổi từ SAFE → WARNING/DANGER
        // 2. Không gửi spam khi level không thay đổi
        if (previousLevel === "SAFE" && (currentLevel === "WARNING" || currentLevel === "DANGER")) {
            console.log(`\n Alert triggered for device ${deviceId}: ${previousLevel} → ${currentLevel}\n`);

            // Lấy danh sách email của người dùng sở hữu device này
            const emails = await getDeviceOwnerEmails(deviceId);

            if (emails.length === 0) {
                console.warn(`No owner found for device ${deviceId}`);
                return;
            }

            // Gửi email cho tất cả chủ sở hữu device
            for (const email of emails) {
                const alertData = {
                    recipientEmail: email,
                    deviceId: deviceId,
                    level: currentLevel,
                    gasValue: data.gas_value || 0,
                    temperature: data.temperature || 0,
                    humidity: data.humidity || 0,
                    updatedAt: data.updated_at,
                };

                await sendAlertEmail(alertData);
            }
        } else if (currentLevel === "SAFE" && previousLevel !== "SAFE") {
            // Level đã quay lại SAFE - thông báo bình thường
            console.log(`Device ${deviceId} returned to SAFE level`);
        }
    } catch (error) {
        console.error("Error in checkAndSendAlert:", error.message);
    }
};

/**
 * Lấy danh sách email của tất cả chủ sở hữu và người được share một device
 * @param {string} deviceId - ID của device
 * @returns {Promise<Array>} - Mảng email (cả owner lẫn shared)
 */
const getDeviceOwnerEmails = (deviceId) => {
    return new Promise((resolve, reject) => {
        // Lấy email từ owner (user_devices) + người được share (device_shares)
        const query = `
            SELECT DISTINCT u.email
            FROM users u
            JOIN user_devices ud ON u.id = ud.user_id
            WHERE ud.device_id = ?
            
            UNION
            
            SELECT DISTINCT u.email
            FROM users u
            JOIN device_shares ds ON u.id = ds.user_id
            WHERE ds.device_id = ?
        `;

        db.query(query, [deviceId, deviceId], (err, results) => {
            if (err) {
                console.error("Error fetching device owner and shared user emails:", err);
                return reject(err);
            }

            const emails = results.map((row) => row.email);
            resolve(emails);
        });
    });
};

/**
 * Reset trạng thái level của một device (khi delete device)
 * @param {string} deviceId - ID của device
 */
const resetDeviceStatus = (deviceId) => {
    delete deviceLevelStatus[deviceId];
    console.log(`Reset status for device ${deviceId}`);
};

//Khởi động lại hệ thống - load trạng thái từ database
const initializeAllDeviceStatus = () => {
    const query = `SELECT device_id, level FROM sensor_current`;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error initializing device status:", err);
            return;
        }

        results.forEach((row) => {
            deviceLevelStatus[row.device_id] = row.level || "SAFE";
        });

        console.log(`Initialized status for ${results.length} devices`);
    });
};

module.exports = {
    checkAndSendAlert,
    getDeviceOwnerEmails,
    resetDeviceStatus,
    initializeAllDeviceStatus,
};
