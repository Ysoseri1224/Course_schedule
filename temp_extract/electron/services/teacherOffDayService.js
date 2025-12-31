const { getDatabase } = require('../database/connection');

function getTeacherOffDays(weekStartDate) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM teacher_off_days
    WHERE week_start_date = ?
  `);
  return stmt.all(weekStartDate);
}

function setTeacherOffDay(teacherId, weekStartDate, dayOfWeek) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO teacher_off_days (teacher_id, week_start_date, day_of_week)
    VALUES (?, ?, ?)
  `);
  stmt.run(teacherId, weekStartDate, dayOfWeek);
  return { success: true };
}

function removeTeacherOffDay(teacherId, weekStartDate, dayOfWeek) {
  const db = getDatabase();
  const stmt = db.prepare(`
    DELETE FROM teacher_off_days
    WHERE teacher_id = ? AND week_start_date = ? AND day_of_week = ?
  `);
  stmt.run(teacherId, weekStartDate, dayOfWeek);
  return { success: true };
}

module.exports = {
  getTeacherOffDays,
  setTeacherOffDay,
  removeTeacherOffDay,
};
