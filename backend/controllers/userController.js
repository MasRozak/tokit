const { pool } = require('../config/mysql');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto')

const getProfile = async (req, res) => {
  try {
    console.log('req.user:', req.user);
    const userId = req.user.id;
    console.log('userId:', userId);

    const [rows] = await pool.query('SELECT * FROM users WHERE id_user = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {last_name, first_name, email, address, current_password, new_password, phone_number} = req.body;
    
    // Get user data first
    const [rows] = await pool.query(`SELECT * FROM users WHERE id_user = ?`, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const user = rows[0];
    let finalPassword = user.password; // Keep existing password by default

    // Only validate and update password if both current_password and new_password are provided
    if (current_password && new_password) {
      const salt = process.env.PASSWORD_SALT;
      const currentHashed = crypto.createHash('sha256').update(`${current_password}${salt}`).digest('hex');
      
      console.log('🔍 Password validation:');
      console.log('Current password from request:', current_password);
      console.log('Current password hashed:', currentHashed);
      console.log('Stored password in DB:', user.password);
      
      // Check if current password matches
      if (currentHashed !== user.password) {
        return res.status(401).json({message: "Current password is incorrect"});
      }
      
      // Hash new password
      finalPassword = crypto.createHash('sha256').update(`${new_password}${salt}`).digest('hex');
      console.log('✅ Password will be updated');
    } else {
      console.log('ℹ️  No password change requested');
    }

    // Update profile with await
    await pool.query(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, address = ?, password = ?, phone_number = ? WHERE id_user = ?', 
      [first_name, last_name, email, address, finalPassword, phone_number, userId]
    );

    console.log('✅ Profile updated successfully for user:', userId);
    return res.status(200).json({message: "Profile updated successfully"});
    
  } catch(err) {
    console.error('❌ Error updating profile:', err);
    return res.status(500).json({message: "Server Error"});
  }
}

module.exports = { getProfile, updateProfile };
