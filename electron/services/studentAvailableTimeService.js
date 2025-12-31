const { getDatabase } = require('../database/connection');

function getStudentAvailableTimes(studentId, weekStartDate) {
  const db = getDatabase();
  if (weekStartDate) {
    const stmt = db.prepare(`
      SELECT day_of_week, time_slot, week_start_date
      FROM student_available_times 
      WHERE student_id = ? AND week_start_date = ?
      ORDER BY day_of_week, time_slot
    `);
    return stmt.all(studentId, weekStartDate);
  } else {
    const stmt = db.prepare(`
      SELECT day_of_week, time_slot, week_start_date
      FROM student_available_times 
      WHERE student_id = ?
      ORDER BY week_start_date, day_of_week, time_slot
    `);
    return stmt.all(studentId);
  }
}

function setStudentAvailableTimes(studentId, weekStartDate, timesArray) {
  const db = getDatabase();
  
  const deleteStmt = db.prepare('DELETE FROM student_available_times WHERE student_id = ? AND week_start_date = ?');
  deleteStmt.run(studentId, weekStartDate);
  
  if (timesArray && timesArray.length > 0) {
    const insertStmt = db.prepare(`
      INSERT INTO student_available_times (student_id, week_start_date, day_of_week, time_slot) 
      VALUES (?, ?, ?, ?)
    `);
    
    for (const time of timesArray) {
      insertStmt.run(studentId, weekStartDate, time.day_of_week, time.time_slot);
    }
  }
  
  return { success: true };
}

module.exports = {
  getStudentAvailableTimes,
  setStudentAvailableTimes,
};
