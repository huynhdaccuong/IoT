const db = require('../config/db');

/**
 * Middleware kiểm tra user có phải là owner của thiết bị không
 * Lấy owner_id từ user_devices table (user_id là owner nếu user_id là người thêm thiết bị)
 * 
 * Sử dụng: router.delete('/:id', deviceOwnerMiddleware, controller)
 */
const deviceOwnerMiddleware = (req, res, next) => {
    const userId = req.user.id;
    const deviceId = req.params.id;

    // Kiểm tra xem user có phải là owner của thiết bị này không
    // Owner là user_id trong user_devices (người đã thêm thiết bị)
    const query = `
        SELECT ud.user_id, ud.device_id
        FROM user_devices ud
        WHERE ud.id = ?
    `;

    db.query(query, [deviceId], (err, results) => {
        if (err) {
            console.error('Device owner check error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Lỗi kiểm tra quyền' 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Thiết bị không tồn tại' 
            });
        }

        const deviceOwner = results[0].user_id;
        
        if (deviceOwner !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn không có quyền thực hiện hành động này. Chỉ owner mới có thể chia sẻ thiết bị.' 
            });
        }

        // Gắn device_id vào req để sử dụng ở controller
        req.deviceId = results[0].device_id;
        next();
    });
};

module.exports = deviceOwnerMiddleware;
