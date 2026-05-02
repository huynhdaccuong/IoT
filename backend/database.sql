-- Unified Database Schema
-- Consolidated from database.sql, update_db.sql, and update_schema.sql

-- ===== CREATE TABLES =====

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    verification_token VARCHAR(255),
    token_expires TIMESTAMP NULL,
    active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices table (Inventory of all valid devices)
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Devices Link (Many-to-Many between Users and Devices)
CREATE TABLE IF NOT EXISTS user_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    device_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) COMMENT 'Tên gợi nhớ do user đặt',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_device (user_id, device_id)
);

-- Device Shares (Chia sẻ thiết bị giữa các user)
CREATE TABLE IF NOT EXISTS device_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_device_share (device_id, user_id)
);

-- Sensor Current Data (Realtime)
CREATE TABLE IF NOT EXISTS sensor_current (
    device_id VARCHAR(50) PRIMARY KEY,
    gas_value INT,
    temperature FLOAT,
    humidity FLOAT,
    risk VARCHAR(50),
    level VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Sensor History Data
CREATE TABLE IF NOT EXISTS sensor_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50),
    gas_value INT,
    temperature FLOAT,
    humidity FLOAT,
    risk VARCHAR(50),
    level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Legacy tables (from old web interface - kept for compatibility if needed)
CREATE TABLE IF NOT EXISTS gas_current (
    id INT PRIMARY KEY AUTO_INCREMENT,
    gas_value INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gas_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    gas_value INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== APPLY SCHEMA UPDATES =====

-- Update devices table to ensure device_id is UNIQUE
ALTER TABLE devices MODIFY COLUMN device_id VARCHAR(50) UNIQUE NOT NULL;

-- Add foreign key constraints to sensor tables
ALTER TABLE sensor_current ADD FOREIGN KEY IF NOT EXISTS (device_id) REFERENCES devices(device_id) ON DELETE CASCADE;
ALTER TABLE sensor_history ADD FOREIGN KEY IF NOT EXISTS (device_id) REFERENCES devices(device_id) ON DELETE CASCADE;