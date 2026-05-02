const db = require('../config/db');

exports.updateMe = (req, res) => {
    const { name } = req.body;
    const userId = req.user.id; // từ middleware auth đã giải mã token và gắn thông tin user vào req.user

    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    const query = 'UPDATE users SET name = ? WHERE id = ?';
    db.query(query, [name, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // trả về thông tin user đã được cập nhật (id, name, email)
        const selectQuery = 'SELECT id, name, email FROM users WHERE id = ?';
        db.query(selectQuery, [userId], (err, results) => {
             if (err) return res.status(500).json({ error: err.message });
             res.json(results[0]);
        });
    });
};
