const db = require('../config/db');

// Lấy danh sách thiết bị của user (cả owner lẫn shared)
exports.getAllDevices = (req, res) => {
    const userId = req.user.id;
    
    // Lấy thiết bị owner của user
    const query = `
        SELECT ud.id, ud.device_id as device_code, ud.name, ud.created_at, ud.user_id as owner_id, true as is_owner
        FROM user_devices ud
        WHERE ud.user_id = ?
        
        UNION
        
        SELECT ud2.id, ud2.device_id as device_code, ud2.name, ud2.created_at, ud2.user_id as owner_id, false as is_owner
        FROM device_shares ds
        JOIN user_devices ud2 ON ds.device_id = ud2.device_id
        WHERE ds.user_id = ? AND ud2.user_id != ?
        
        ORDER BY created_at DESC
    `;
    
    db.query(query, [userId, userId, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }
        
        // Trả về danh sách với thông tin owner
        res.json(results);
    });
};

// Thêm thiết bị mới
exports.addDevice = (req, res) => {
    const userId = req.user.id;
    const { device_code, name } = req.body;

    if (!device_code || !name) {
        return res.status(400).json({ message: "Vui lòng nhập mã thiết bị và tên thiết bị" });
    }

    // kiểm tra nếu thiết bị đã tồn tại trong user_devices của user này chưa
    db.query('SELECT * FROM user_devices WHERE user_id = ? AND device_id = ?', [userId, device_code], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            return res.status(400).json({ message: "Thiết bị này đã được thêm vào tài khoản của bạn" });
        }

        // kiểm tra nếu thiết bị đã tồn tại trong hệ thống (trong bảng devices) chưa, nếu chưa thì thêm vào để quản lý chung
        // Note: We might also want to ensure it exists in 'devices' master table, 
        // but for simplicity let's just allow adding any code and linking it.
        // Ideally, we should insert into 'devices' table first if not exists.
        
        const insertDeviceQuery = 'INSERT IGNORE INTO devices (device_id, name) VALUES (?, ?)';
        db.query(insertDeviceQuery, [device_code, name], (err) => {
             if (err) console.log("Warning: Could not insert into devices table (might exist)", err);
             
             // liên kết thiết bị với user trong user_devices
             const insertLinkQuery = 'INSERT INTO user_devices (user_id, device_id, name) VALUES (?, ?, ?)';
             db.query(insertLinkQuery, [userId, device_code, name], (err, result) => {
                 if (err) return res.status(500).json({ error: err.message });
                 
                 res.status(201).json({ 
                     message: "Thêm thiết bị thành công",
                     device: {
                         id: result.insertId,
                         device_code,
                         name
                     }
                 });
             });
        });
    });
};

// Lấy chi tiết thiết bị (cả owner lẫn shared)
exports.getDeviceDetail = (req, res) => {
    const userId = req.user.id;
    const deviceId = req.params.id; // đây là ID trong bảng user_devices, không phải device_id chung của thiết bị, cần kiểm tra quyền sở hữu và chia sẻ dựa trên user_devices.id
    
    // Kiểm tra xem user có owner thiết bị này không, hoặc đã được share
    const query = `
        SELECT 
            ud.id, 
            ud.device_id as device_code, 
            ud.name, 
            ud.created_at, 
            ud.user_id as owner_id,
            CASE 
                WHEN ud.user_id = ? THEN true 
                ELSE false 
            END as is_owner
        FROM user_devices ud
        WHERE ud.id = ? AND (
            ud.user_id = ? 
            OR ud.device_id IN (
                SELECT device_id FROM device_shares WHERE user_id = ?
            )
        )
    `;
    
    db.query(query, [userId, deviceId, userId, userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Device not found or access denied" });
        
        res.json(results[0]);
    });
};

// Xóa thiết bị
exports.deleteDevice = (req, res) => {
    const userId = req.user.id;
    const deviceId = req.params.id; // id từ user_devices table,  cần xác định xem user có phải owner hay shared user để xóa đúng bảng (user_devices hoặc device_shares)

    // Bước 1: Kiểm tra xem user có owner device này không
    const checkOwnerQuery = 'SELECT device_id FROM user_devices WHERE id = ? AND user_id = ?';
    db.query(checkOwnerQuery, [deviceId, userId], (err, ownerResults) => {
        if (err) return res.status(500).json({ error: err.message });

        if (ownerResults.length > 0) {
            // User là owner, xóa từ user_devices
            const deleteOwnerQuery = 'DELETE FROM user_devices WHERE id = ? AND user_id = ?';
            db.query(deleteOwnerQuery, [deviceId, userId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Xóa thiết bị thành công" });
            });
        } else {
            // Bước 2: Kiểm tra xem device có được share cho user này không
            const checkSharedQuery = `
                SELECT ud.device_id 
                FROM user_devices ud
                WHERE ud.id = ? AND ud.device_id IN (
                    SELECT device_id FROM device_shares WHERE user_id = ?
                )
            `;
            db.query(checkSharedQuery, [deviceId, userId], (err, sharedResults) => {
                if (err) return res.status(500).json({ error: err.message });

                if (sharedResults.length > 0) {
                    // Device được share cho user, xóa từ device_shares
                    const deviceCode = sharedResults[0].device_id;
                    const deleteShareQuery = 'DELETE FROM device_shares WHERE device_id = ? AND user_id = ?';
                    db.query(deleteShareQuery, [deviceCode, userId], (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ message: "Xóa thiết bị thành công" });
                    });
                } else {
                    // Device không tồn tại hoặc không có quyền xóa
                    return res.status(404).json({ message: "Thiết bị không tồn tại hoặc bạn không có quyền xóa" });
                }
            });
        }
    });
};

/**
 * Chia sẻ thiết bị với user khác
 * POST /api/devices/:id/share
 * Body: { email }
 */
exports.shareDevice = (req, res) => {
    const currentUserId = req.user.id;
    const userDeviceId = req.params.id; // ID từ user_devices table
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ 
            success: false,
            message: "Vui lòng nhập email người nhận" 
        });
    }

    // Bước 1: Lấy device_id từ user_devices 
    const getDeviceQuery = 'SELECT device_id FROM user_devices WHERE id = ? AND user_id = ?';
    db.query(getDeviceQuery, [userDeviceId, currentUserId], (err, deviceResults) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                message: "Lỗi kiểm tra thiết bị" 
            });
        }

        if (deviceResults.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Thiết bị không tồn tại hoặc bạn không có quyền chia sẻ" 
            });
        }

        const deviceId = deviceResults[0].device_id;

        // Bước 2: Kiểm tra email có tồn tại trong hệ thống
        const checkUserQuery = 'SELECT id FROM users WHERE email = ?';
        db.query(checkUserQuery, [email], (err, userResults) => {
            if (err) {
                return res.status(500).json({ 
                    success: false,
                    message: "Lỗi kiểm tra người dùng" 
                });
            }

            if (userResults.length === 0) {
                return res.status(400).json({ 
                    success: false,
                    message: "Người dùng không tồn tại" 
                });
            }

            const targetUserId = userResults[0].id;

            // Bước 3: Kiểm tra user không tự share cho chính mình
            if (targetUserId === currentUserId) {
                return res.status(400).json({ 
                    success: false,
                    message: "Bạn không thể chia sẻ thiết bị cho chính mình" 
                });
            }

            // Bước 4: Đếm số lượng user đã được share (không tính owner)
            const countShareQuery = 'SELECT COUNT(*) as count FROM device_shares WHERE device_id = ?';
            db.query(countShareQuery, [deviceId], (err, countResults) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false,
                        message: "Lỗi kiểm tra giới hạn chia sẻ" 
                    });
                }

                const shareCount = countResults[0].count;
                if (shareCount >= 3) {
                    return res.status(400).json({ 
                        success: false,
                        message: "Thiết bị đã đạt giới hạn chia sẻ (tối đa 3 người)" 
                    });
                }

                // Bước 5: Kiểm tra user đã được share chưa
                const checkExistShareQuery = 'SELECT id FROM device_shares WHERE device_id = ? AND user_id = ?';
                db.query(checkExistShareQuery, [deviceId, targetUserId], (err, existResults) => {
                    if (err) {
                        return res.status(500).json({ 
                            success: false,
                            message: "Lỗi kiểm tra trạng thái chia sẻ" 
                        });
                    }

                    if (existResults.length > 0) {
                        return res.status(400).json({ 
                            success: false,
                            message: "Thiết bị đã được chia sẻ với người dùng này rồi" 
                        });
                    }

                    // Bước 6: Thêm vào device_shares
                    const insertShareQuery = 'INSERT INTO device_shares (device_id, user_id) VALUES (?, ?)';
                    db.query(insertShareQuery, [deviceId, targetUserId], (err, result) => {
                        if (err) {
                            return res.status(500).json({ 
                                success: false,
                                message: "Lỗi khi chia sẻ thiết bị" 
                            });
                        }

                        res.status(201).json({ 
                            success: true,
                            message: `Chia sẻ thiết bị thành công với ${email}`,
                            data: {
                                share_id: result.insertId,
                                device_id: deviceId,
                                user_email: email
                            }
                        });
                    });
                });
            });
        });
    });
};

/**
 * Lấy danh sách user đã được chia sẻ thiết bị
 * GET /api/devices/:id/share
 */
exports.getSharedUsers = (req, res) => {
    const currentUserId = req.user.id;
    const userDeviceId = req.params.id;

    // Lấy device_id từ user_devices (cho phép owner xem)
    // Hoặc từ device_shares (cho phép shared user xem)
    const getDeviceQuery = `
        SELECT DISTINCT ud.device_id
        FROM user_devices ud
        WHERE ud.id = ? AND (
            ud.user_id = ? 
            OR ud.device_id IN (
                SELECT device_id FROM device_shares WHERE user_id = ?
            )
        )
    `;
    
    db.query(getDeviceQuery, [userDeviceId, currentUserId, currentUserId], (err, deviceResults) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                message: "Lỗi kiểm tra thiết bị" 
            });
        }

        if (deviceResults.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Thiết bị không tồn tại" 
            });
        }

        const deviceId = deviceResults[0].device_id;

        // Lấy danh sách user đã được chia sẻ
        const getSharedQuery = `
            SELECT ds.id as share_id, u.id as user_id, u.email, u.name, ds.created_at
            FROM device_shares ds
            JOIN users u ON ds.user_id = u.id
            WHERE ds.device_id = ?
            ORDER BY ds.created_at DESC
        `;

        db.query(getSharedQuery, [deviceId], (err, results) => {
            if (err) {
                return res.status(500).json({ 
                    success: false,
                    message: "Lỗi lấy danh sách chia sẻ" 
                });
            }

            res.json({ 
                success: true,
                data: results 
            });
        });
    });
};

/**
 * Xóa user khỏi danh sách chia sẻ
 * DELETE /api/devices/:id/share/:shareUserId
 */
exports.removeSharedUser = (req, res) => {
    const currentUserId = req.user.id;
    const userDeviceId = req.params.id;
    const shareUserId = req.params.shareUserId;

    // Kiểm tra user hiện tại có phải owner không
    const getDeviceQuery = 'SELECT device_id FROM user_devices WHERE id = ? AND user_id = ?';
    db.query(getDeviceQuery, [userDeviceId, currentUserId], (err, deviceResults) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                message: "Lỗi kiểm tra thiết bị" 
            });
        }

        if (deviceResults.length === 0) {
            return res.status(403).json({ 
                success: false,
                message: "Bạn không có quyền thực hiện hành động này" 
            });
        }

        const deviceId = deviceResults[0].device_id;

        // Xóa user khỏi device_shares
        const deleteShareQuery = 'DELETE FROM device_shares WHERE device_id = ? AND user_id = ?';
        db.query(deleteShareQuery, [deviceId, shareUserId], (err, result) => {
            if (err) {
                return res.status(500).json({ 
                    success: false,
                    message: "Lỗi khi xóa chia sẻ" 
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: "Không tìm thấy chia sẻ để xóa" 
                });
            }

            res.json({ 
                success: true,
                message: "Đã xóa quyền truy cập của người dùng" 
            });
        });
    });
};

/**
 * Cập nhật thiết bị (đổi tên)
 * PUT /api/devices/:id
 * Body: { name }
 */
exports.updateDevice = (req, res) => {
    const userId = req.user.id;
    const deviceId = req.params.id; // id từ user_devices table
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Tên thiết bị không được để trống" });
    }

    if (name.trim().length > 50) {
        return res.status(400).json({ message: "Tên thiết bị không được vượt quá 50 ký tự" });
    }

    // xác thực user có phải owner của thiết bị này không (chỉ owner mới được đổi tên)
    const query = 'SELECT device_id FROM user_devices WHERE id = ? AND user_id = ?';
    db.query(query, [deviceId, userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(403).json({ message: "Thiết bị không tồn tại hoặc bạn không có quyền chỉnh sửa" });
        }

        // cập nhật tên thiết bị trong user_devices
        const updateQuery = 'UPDATE user_devices SET name = ? WHERE id = ? AND user_id = ?';
        db.query(updateQuery, [name.trim(), deviceId, userId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({ 
                message: "Cập nhật tên thiết bị thành công",
                device: {
                    id: deviceId,
                    name: name.trim()
                }
            });
        });
    });
};
