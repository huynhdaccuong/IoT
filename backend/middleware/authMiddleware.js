const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // lấy token từ header Authorization
    const token = req.header('Authorization');

    // Debugging: in ra thông tin token để kiểm tra
    console.log(`[AuthMiddleware] Header: ${token ? 'Present' : 'Missing'}`);

    // kiểm tra nếu không có token thì trả về lỗi
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // xác thực token, nếu hợp lệ sẽ trả về payload đã được mã hóa (thường chứa thông tin user như id, email)
        // Typically token comes as "Bearer <token>"
        // Tách "Bearer " ra khỏi chuỗi
        const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length).trim() : token;

        if (!tokenString) {
             console.log('[AuthMiddleware] Format Error: Empty token string');
             return res.status(401).json({ message: 'Token format invalid' });
        }

        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

        // Gắn user vào req để dùng ở controller tiếp theo
        req.user = decoded;
        next();
    } catch (err) {
        console.error('[AuthMiddleware] Verify Error:', err.message);
        res.status(401).json({ message: 'Token is not valid or expired' });
    }
};

module.exports = authMiddleware;
