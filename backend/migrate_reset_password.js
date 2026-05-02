const db = require('./config/db');

const migrate = () => {
    const query = `
        ALTER TABLE users 
        ADD COLUMN reset_token VARCHAR(255) NULL,
        ADD COLUMN reset_token_expires TIMESTAMP NULL;
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error adding columns:', err.message);
        } else {
            console.log('Columns reset_token and reset_token_expires added successfully.');
        }
        process.exit();
    });
};

migrate();
