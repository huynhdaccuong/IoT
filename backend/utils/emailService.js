const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = (email, token) => {
    // Note: The user requested "http://localhost:3000/api/auth/verify?token=..." which is a backend link
    const url = `http://localhost:3000/api/auth/verify?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Xác thực email của bạn',
        html: `<h3>Nhấp vào liên kết dưới đây để xác thực email của bạn:</h3>
               <a href="${url}">${url}</a>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

const sendResetPasswordEmail = (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Cài lại mật khẩu',
        html: `<h3>Bạn đã yêu cầu đặt lại mật khẩu.</h3>
               <p>Nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
               <a href="${url}">${url}</a>
               <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

/**
 * Gửi email cảnh báo từ hệ thống IoT
 * @param {Object} alertData - Dữ liệu cảnh báo
 * @param {string} alertData.recipientEmail - Email người nhận
 * @param {string} alertData.deviceId - ID thiết bị
 * @param {string} alertData.level - Mức cảnh báo (WARNING/DANGER)
 * @param {number} alertData.gasValue - Giá trị khí gas
 * @param {number} alertData.temperature - Nhiệt độ
 * @param {number} alertData.humidity - Độ ẩm
 * @param {string} alertData.updatedAt - Thời gian cập nhật
 */
const sendAlertEmail = async (alertData) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error("Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env");
        }

        const {
            recipientEmail,
            deviceId,
            level,
            gasValue,
            temperature,
            humidity,
            updatedAt,
        } = alertData;

        // Xác định mức độ cảnh báo màu sắc
        const levelBadge = level === "DANGER" ? "DANGER" : "WARNING";

        // HTML email template
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background-color: ${level === "DANGER" ? "#ff4444" : "#ffaa00"}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 20px; }
                    .alert-level { font-size: 20px; font-weight: bold; margin: 10px 0; }
                    .data-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
                    .data-label { font-weight: bold; color: #333; }
                    .data-value { color: #666; }
                    .footer { text-align: center; padding: 10px; color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>CẢNH BÁO CHÁY NỔ - ESP32</h1>
                    </div>
                    <div class="content">
                        <div class="alert-level">${levelBadge}</div>
                        
                        <div class="data-row">
                            <span class="data-label">Device ID:</span>
                            <span class="data-value">${deviceId}</span>
                        </div>
                        
                        <div class="data-row">
                            <span class="data-label">Mức cảnh báo:</span>
                            <span class="data-value">${level}</span>
                        </div>
                        
                        <div class="data-row">
                            <span class="data-label">Giá trị khí gas:</span>
                            <span class="data-value">${gasValue}</span>
                        </div>
                        
                        <div class="data-row">
                            <span class="data-label">Nhiệt độ:</span>
                            <span class="data-value">${temperature}°C</span>
                        </div>
                        
                        <div class="data-row">
                            <span class="data-label">Độ ẩm:</span>
                            <span class="data-value">${humidity}%</span>
                        </div>
                        
                        <div class="data-row">
                            <span class="data-label">Thời gian:</span>
                            <span class="data-value">${new Date(updatedAt).toLocaleString("vi-VN")}</span>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Đây là email cảnh báo tự động từ hệ thống IoT. Vui lòng kiểm tra ngay.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: `CẢNH BÁO CHÁY NỔ - ${level} - Device ${deviceId}`,
            html: htmlContent,
        };

        // Gửi email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Alert email sent to ${recipientEmail}:`, info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending alert email:", error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail, sendAlertEmail };
