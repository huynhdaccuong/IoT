const db = require('./config/db');

/**
 * Migration script để tạo bảng device_shares
 * Chạy: node migrate_device_sharing.js
 */

const createDeviceSharesTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS device_shares (
            id INT AUTO_INCREMENT PRIMARY KEY,
            device_id VARCHAR(50) NOT NULL,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_device_share (device_id, user_id)
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.error('Lỗi tạo bảng device_shares:', err.message);
            process.exit(1);
        }

        console.log('Bảng device_shares đã được tạo thành công!');
        process.exit(0);
    });
};

// Chạy migration
console.log('Bắt đầu migration...');
createDeviceSharesTable();
