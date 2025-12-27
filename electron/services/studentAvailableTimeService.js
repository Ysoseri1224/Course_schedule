const { getDatabase } = require('../database/connection');

function getStudentAvailableTimes(studentId) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT day_of_week, time_slot 
    FROM student_available_times 
    WHERE student_id = ?
    ORDER BY day_of_week, time_slot
  `);
  return stmt.all(studentId);
}

function setStudentAvailableTimes(studentId, timesArray) {
  const db = getDatabase();
  
  // 先删除该学生的所有可用时段
  const deleteStmt = db.prepare('DELETE FROM student_available_times WHERE student_id = ?');
  deleteStmt.run(studentId);
  
  // 插入新的可用时段
  if (timesArray && timesArray.length > 0) {
    const insertStmt = db.prepare(`
      INSERT INTO student_available_times (student_id, day_of_week, time_slot) 
      VALUES (?, ?, ?)
    `);
    
    for (const time of timesArray) {
      insertStmt.run(studentId, time.day_of_week, time.time_slot);
    }
  }
  
  return { success: true };
}

module.exports = {
  getStudentAvailableTimes,
  setStudentAvailableTimes,
};
