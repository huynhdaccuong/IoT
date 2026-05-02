const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Cần thiết cho việc tạo token
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/emailService');

// Đăng ký
exports.register = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Mật khẩu không khớp" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Mật khẩu phải có ít nhất 8 ký tự" });
    }

    // Kiểm tra email đã tồn tại chưa
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create verification token (crypto)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Insert into DB
        const query = 'INSERT INTO users (name, email, password_hash, verification_token, token_expires, active) VALUES (?, ?, ?, ?, ?, ?)';
        
        db.query(query, [name, email, hashedPassword, verificationToken, tokenExpires, false], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // Gửi email xác thực
            sendVerificationEmail(email, verificationToken);

            res.status(201).json({ 
                message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản."
            });
        });
    });
};

// Xác thực email
exports.verifyEmail = (req, res) => {
    console.log("Verify endpoint hit with query:", req.query); // Debug log
    const { token } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Default to Vite port 5173

    const getHtml = (status, title, message, color) => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <div class="mb-4 flex justify-center text-${color}-500">
                    ${status === 'success' ? `
                    <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    ` : `
                    <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    `}
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">${title}</h2>
                <p class="text-gray-600 mb-6">${message}</p>
                <a href="${frontendUrl}/login" 
                   class="inline-block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200">
                    Đến trang đăng nhập
                </a>
            </div>
        </body>
        </html>
    `;

    if (!token) {
        return res.send(getHtml('error', 'Verification Failed', 'Invalid token', 'red'));
    }

    // Tìm người dùng với token
    db.query('SELECT * FROM users WHERE verification_token = ?', [token], (err, results) => {
        if (err) {
             return res.status(500).send(getHtml('error', 'Error', 'Database error', 'red'));
        }

        if (results.length === 0) {
            return res.status(400).send(getHtml('error', 'Verification Failed', 'Invalid or expired token', 'red'));
        }

        const user = results[0];

        // Kiểm tra token đã hết hạn chưa
        if (new Date() > new Date(user.token_expires)) {
            return res.status(400).send(getHtml('error', 'Verification Failed', 'Token expired', 'red'));
        }

        // Activate người dùng
        // Thử cập nhật cả active và is_verified, nếu lỗi (do thiếu is_verified) thì fallback chỉ cập nhật active
        const updateQuery = `
            UPDATE users 
            SET active = TRUE, 
                verification_token = NULL, 
                token_expires = NULL,
                is_verified = 1 
            WHERE id = ?
        `;
        
        db.query(updateQuery, [user.id], (err, result) => {
            if (err) {
                // Nếu lỗi do thiếu cột is_verified, thì fallback chỉ cập nhật active và bỏ qua is_verified
                // Đây là giải pháp tạm thời để tránh lỗi khi cột is_verified chưa được thêm vào database, nhưng vẫn đảm bảo tài khoản được kích hoạt
                const fallbackQuery = 'UPDATE users SET active = TRUE, verification_token = NULL, token_expires = NULL WHERE id = ?';
                db.query(fallbackQuery, [user.id], (fallbackErr, fallbackResult) => {
                     if (fallbackErr) return res.status(500).send(getHtml('error', 'Error', 'Database error', 'red'));
                     return res.send(getHtml('success', 'Xác thực email thành công', 'Tài khoản của bạn đã được xác thực thành công.', 'green'));
                });
            } else {
                return res.send(getHtml('success', 'Xác thực email thành công', 'Tài khoản của bạn đã được xác thực thành công.', 'green'));
            }
        });
    });
};

// Gửi lại email xác thực
exports.resendVerification = (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Vui lòng nhập địa chỉ email" });

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const user = results[0];

        if (user.active) {
            return res.status(400).json({ message: "Người dùng đã được xác thực" });
        }

        //Tạo lại token mới và cập nhật thời gian hết hạn
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        const updateQuery = 'UPDATE users SET verification_token = ?, token_expires = ? WHERE id = ?';

        db.query(updateQuery, [verificationToken, tokenExpires, user.id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            sendVerificationEmail(email, verificationToken);

            res.json({ message: "Email xác thực đã được gửi lại thành công" });
        });
    });
};

// Đăng nhập
exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
        }

        const user = results[0];

        if (!user.active) { // kiểm tra nếu tài khoản chưa được kích hoạt (chưa xác thực email)
            return res.status(400).json({ message: "Vui lòng xác thực email của bạn trước tiên" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: "Đăng nhập thành công", token, user: { id: user.id, email: user.email, name: user.name } });
    });
};

// thay đổi mật khẩu
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Mật khẩu mới không khớp" });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    db.query('SELECT * FROM users WHERE id = ?', [userId], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Người dùng không tồn tại" });

        const user = results[0];

        // xác thực mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
        }

        // mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // cập nhật mật khẩu mới vào database
        db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Cập nhật mật khẩu thành công" });
        });
    });
};

// quên mật khẩu
exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Vui lòng cung cấp email" });
    }

    // kiểm tra nếu người dùng tồn tại 
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(404).json({ message: "Email không tồn tại" });
        }

        const user = results[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        const updateQuery = 'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?';
        db.query(updateQuery, [resetToken, resetTokenExpires, user.id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // gửi email chứa link reset mật khẩu
            sendResetPasswordEmail(email, resetToken);
            res.json({ message: "Link đặt lại mật khẩu đã được gửi đến email" });
        });
    });
};

// cài đặt lại mật khẩu
exports.resetPassword = (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Mật khẩu mới không khớp" });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    db.query('SELECT * FROM users WHERE reset_token = ?', [token], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) {
            return res.status(400).json({ message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" });
        }

        const user = results[0];

        if (new Date() > new Date(user.reset_token_expires)) {
            return res.status(400).json({ message: "Token đặt lại mật khẩu đã hết hạn" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateQuery = 'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?';
        db.query(updateQuery, [hashedPassword, user.id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Đặt lại mật khẩu thành công" });
        });
    });
};
