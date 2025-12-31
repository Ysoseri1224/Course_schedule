const { getDatabase } = require('../database/connection');
const crypto = require('crypto');

function updateTeacherDetails(teacherId, details) {
  const db = getDatabase();
  
  const fields = [];
  const values = [];
  
  const allowedFields = ['username', 'phone', 'email', 'role'];
  
  allowedFields.forEach(field => {
    if (details[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(details[field]);
    }
  });
  
  if (details.password !== undefined && details.password.trim() !== '') {
    const hashedPassword = crypto.createHash('sha256').update(details.password).digest('hex');
    fields.push('password = ?');
    values.push(hashedPassword);
  }
  
  if (fields.length === 0) {
    return { success: true, message: '没有需要更新的字段' };
  }
  
  values.push(teacherId);
  
  const sql = `UPDATE teachers SET ${fields.join(', ')} WHERE id = ?`;
  const stmt = db.prepare(sql);
  stmt.run(...values);
  
  return { success: true, message: '教师信息更新成功' };
}

function getTeacherDetails(teacherId) {
  try {
    const db = getDatabase();
    const stmt = db.prepare('SELECT id, name, subjects, username, role, phone, email, created_at FROM teachers WHERE id = ?');
    const result = stmt.get(teacherId);
    
    if (!result) {
      console.error(`Teacher with id ${teacherId} not found`);
      return null;
    }
    
    console.log(`Loaded teacher details for id ${teacherId}:`, result);
    return result;
  } catch (error) {
    console.error('Error loading teacher details:', error);
    throw error;
  }
}

function getAllTeachersDetails() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT id, name, subjects, username, role, phone, email, created_at FROM teachers ORDER BY created_at DESC');
  return stmt.all();
}

module.exports = {
  updateTeacherDetails,
  getTeacherDetails,
  getAllTeachersDetails,
};
