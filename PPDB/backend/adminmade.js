const bcrypt = require('bcrypt');
const db = require('./config/db'); 
require('dotenv').config(); 

const adminData = {
  username: 'user',
  email: 'ser@email.com',
  password: '0987654321',
  role: 'user'
};

(async () => {
  try {
    
    const connection = db.promise();
    
    const [testConn] = await connection.query('SELECT 1 + 1 AS result');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [adminData.email]);
    
    if (existingUsers.length > 0) {
      const [updateResult] = await connection.query(
        'UPDATE users SET password = ?, role = ? WHERE email = ?',
        [hashedPassword, adminData.role, adminData.email]
      );
    } else {
      const [insertResult] = await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [adminData.username, adminData.email, hashedPassword, adminData.role]
      );
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
})();