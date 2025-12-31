const { getDatabase } = require('../database/connection');

function updateStudentDetails(studentId, details) {
  const db = getDatabase();
  
  const fields = [];
  const values = [];
  
  const allowedFields = [
    'gender', 'phone', 'english_level', 'school', 'target_score',
    'father_name', 'father_phone', 'mother_name', 'mother_phone',
    'status', 'course_type', 'completed_hours', 'cancelled_hours',
    'bank_account', 'tuition_amount', 'payment_status'
  ];
  
  allowedFields.forEach(field => {
    if (details[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(details[field]);
    }
  });
  
  if (fields.length === 0) {
    return { success: true, message: '没有需要更新的字段' };
  }
  
  values.push(studentId);
  
  const sql = `UPDATE students SET ${fields.join(', ')} WHERE id = ?`;
  const stmt = db.prepare(sql);
  stmt.run(...values);
  
  return { success: true, message: '学员信息更新成功' };
}

function getStudentDetails(studentId) {
  try {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM students WHERE id = ?');
    const result = stmt.get(studentId);
    
    if (!result) {
      console.error(`Student with id ${studentId} not found`);
      return null;
    }
    
    console.log(`Loaded student details for id ${studentId}:`, result);
    return result;
  } catch (error) {
    console.error('Error loading student details:', error);
    throw error;
  }
}

function getAllStudentsDetails() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM students ORDER BY created_at DESC');
  return stmt.all();
}

function calculateCompletedHours(studentId) {
  const db = getDatabase();
  const dayjs = require('dayjs');
  
  const student = db.prepare('SELECT start_date FROM students WHERE id = ?').get(studentId);
  if (!student || !student.start_date) {
    return 0;
  }
  
  const today = dayjs().format('YYYY-MM-DD');
  
  const stmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM schedules
    WHERE student_id = ?
    AND week_start_date >= ?
    AND week_start_date <= ?
  `);
  
  const result = stmt.get(studentId, student.start_date, today);
  return result.count || 0;
}

module.exports = {
  updateStudentDetails,
  getStudentDetails,
  getAllStudentsDetails,
  calculateCompletedHours,
};
