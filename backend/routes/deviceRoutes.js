const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middleware/authMiddleware');
const deviceOwnerMiddleware = require('../middleware/deviceOwnerMiddleware');

// Tất cả các route đều cần đăng nhập
router.use(authMiddleware);

// Lấy danh sách thiết bị
router.get('/', deviceController.getAllDevices);

// Thêm thiết bị
router.post('/', deviceController.addDevice);

// Lấy chi tiết thiết bị (theo ID trong user_devices)
router.get('/:id', deviceController.getDeviceDetail);

// Cập nhật thiết bị (đổi tên)
router.put('/:id', deviceController.updateDevice);

// Xóa thiết bị
router.delete('/:id', deviceController.deleteDevice);

// ==================== DEVICE SHARING ====================

// Chia sẻ thiết bị với user khác
// POST /api/devices/:id/share
router.post('/:id/share', deviceController.shareDevice);

// Lấy danh sách user đã được chia sẻ thiết bị
// GET /api/devices/:id/share
router.get('/:id/share', deviceController.getSharedUsers);

// Xóa user khỏi danh sách chia sẻ
// DELETE /api/devices/:id/share/:shareUserId
router.delete('/:id/share/:shareUserId', deviceOwnerMiddleware, deviceController.removeSharedUser);

module.exports = router;