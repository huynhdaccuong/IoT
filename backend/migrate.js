const db = require('./config/db');

const migrate = () => {
    const alterQuery = `
        ALTER TABLE users 
        ADD COLUMN name VARCHAR(255) AFTER id,
        ADD COLUMN token_expires TIMESTAMP NULL AFTER verification_token,
        CHANGE COLUMN is_verified active BOOLEAN DEFAULT FALSE;
    `;

    db.query(alterQuery, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Columns already exist or updated.');
            } else if (err.code === 'ER_BAD_FIELD_ERROR') {
                 console.log('Column is_verified might not exist, trying to add active column directly.');
                 // Fallback if is_verified doesn't exist
                 db.query("ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT FALSE", (e) => {
                     if(e) console.log(e.message);
                 });
            } else {
                console.error('Error updating table:', err.message);
            }
        } else {
            console.log('Table users updated successfully.');
        }
        process.exit();
    });
};

migrate();
