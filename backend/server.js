const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const dotenv = require("dotenv");
const db = require("./config/db");
const { checkAndSendAlert, initializeAllDeviceStatus } = require("./services/alertService");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================
// ROUTES
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/devices", deviceRoutes);

// ==========================
// BIẾN LƯU HISTORY THEO DEVICE
// ==========================
let lastSavedMinute = {};


//API MỚI (ESP32 gửi gas + temp + hum + device_id)

app.post("/api/data", (req, res) => {
    const { device_id, gas, temperature, humidity, level } = req.body;

    if (!device_id) {
        return res.status(400).send("No device_id");
    }

    //UPDATE REALTIME (mỗi device 1 dòng)
    db.query(
        `INSERT INTO sensor_current 
        (device_id, gas_value, temperature, humidity, level)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        gas_value = VALUES(gas_value),
        temperature = VALUES(temperature),
        humidity = VALUES(humidity),
        level = VALUES(level)`,
        [device_id, gas, temperature, humidity, level],
        (err) => {
            if (err) {
                console.log("Realtime error:", err);
                return res.status(500).send("Realtime error");
            }

            //KIỂM TRA VÀ GỬI CẢNH BÁO NẾU CẦN
            const alertData = {
                device_id,
                gas_value: gas,
                temperature,
                humidity,
                level,
                updated_at: new Date(),
            };
            checkAndSendAlert(alertData);
        }
    );

    //LƯU HISTORY MỖI 1 PHÚT / DEVICE
    const minute = new Date().getMinutes();

    if (lastSavedMinute[device_id] !== minute) {
        lastSavedMinute[device_id] = minute;

        db.query(
            `INSERT INTO sensor_history 
            (device_id, gas_value, temperature, humidity, level)
            VALUES (?, ?, ?, ?, ?)`,
            [device_id, gas, temperature, humidity, level],
            (err) => {
                if (err) {
                    console.log("History error:", err);
                }
            }
        );
    }

    res.send("OK");
});


//API CŨ (GIỮ LẠI - KHÔNG BREAK ESP32 CŨ)

let lastSavedMinuteOld = null;

app.post("/api/gas", (req, res) => {
    const { gas } = req.body;

    if (gas === undefined) {
        return res.status(400).send("No gas value");
    }

    db.query(
        "UPDATE gas_current SET gas_value = ? WHERE id = 1",
        [gas]
    );

    const currentMinute = new Date().getMinutes();

    if (currentMinute !== lastSavedMinuteOld) {
        lastSavedMinuteOld = currentMinute;

        db.query(
            "INSERT INTO gas_history (gas_value) VALUES (?)",
            [gas]
        );
    }

    res.send("OK");
});


//GET REALTIME THEO DEVICE

app.get("/api/current/:device_id", (req, res) => {
    db.query(
        "SELECT * FROM sensor_current WHERE device_id = ?",
        [req.params.device_id],
        (err, rows) => {
            if (err) return res.status(500).send("DB error");
            res.json(rows[0]);
        }
    );
});


//GET HISTORY THEO DEVICE

app.get("/api/history/:device_id", (req, res) => {
    db.query(
        `SELECT * FROM sensor_history 
         WHERE device_id = ?
         ORDER BY created_at DESC 
         LIMIT 100`,
        [req.params.device_id],
        (err, rows) => {
            if (err) return res.status(500).send("DB error");
            res.json(rows);
        }
    );
});


// API CŨ CHO WEB (GIỮ LẠI)

app.get("/api/data/current", (req, res) => {
    db.query(
        "SELECT * FROM gas_current WHERE id = 1",
        (err, rows) => {
            if (err) return res.status(500).send("DB error");
            res.json(rows[0]);
        }
    );
});

app.get("/api/data/history", (req, res) => {
    db.query(
        "SELECT * FROM gas_history ORDER BY created_at DESC LIMIT 50",
        (err, rows) => {
            if (err) return res.status(500).send("DB error");
            res.json(rows);
        }
    );
});

// ==========================
app.listen(3000, () => {
    console.log("🚀 Backend running http://localhost:3000");
    
    //Khởi tạo hệ thống cảnh báo - load trạng thái từ database
    initializeAllDeviceStatus();
});