const { getDatabase } = require('../database/connection');

function getSchedules(weekStart) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT s.*, 
           st.name as student_name, 
           t.name as teacher_name
    FROM schedules s
    LEFT JOIN students st ON s.student_id = st.id
    LEFT JOIN teachers t ON s.teacher_id = t.id
    WHERE s.week_start_date = ?
    ORDER BY s.day_of_week, s.time_slot
  `);
  return stmt.all(weekStart);
}

function addSchedule(schedule) {
  const db = getDatabase();
  
  const transaction = db.transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO schedules 
      (student_id, teacher_id, subject, day_of_week, time_slot, week_start_date, note, course_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      schedule.studentId,
      schedule.teacherId,
      schedule.subject,
      schedule.dayOfWeek,
      schedule.timeSlot,
      schedule.weekStartDate,
      schedule.note || null,
      schedule.courseType || null
    );
    
    return { id: result.lastInsertRowid, ...schedule };
  });
  
  return transaction();
}

function updateSchedule(id, schedule) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE schedules 
    SET student_id = ?, teacher_id = ?, subject = ?, 
        day_of_week = ?, time_slot = ?
    WHERE id = ?
  `);
  
  stmt.run(
    schedule.studentId,
    schedule.teacherId,
    schedule.subject,
    schedule.dayOfWeek,
    schedule.timeSlot,
    id
  );
  
  return { id, ...schedule };
}

function deleteSchedule(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM schedules WHERE id = ?');
  stmt.run(id);
  return { success: true };
}

function getStudentTeacherSubjects(studentId) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT sts.*, t.name as teacher_name
    FROM student_teacher_subjects sts
    LEFT JOIN teachers t ON sts.teacher_id = t.id
    WHERE sts.student_id = ?
  `);
  return stmt.all(studentId);
}

function setStudentTeacherSubject(studentId, teacherId, subject) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO student_teacher_subjects 
    (student_id, teacher_id, subject)
    VALUES (?, ?, ?)
  `);
  stmt.run(studentId, teacherId, subject);
  return { success: true };
}

function deleteStudentTeacherSubject(studentId, subject) {
  const db = getDatabase();
  const stmt = db.prepare(`
    DELETE FROM student_teacher_subjects 
    WHERE student_id = ? AND subject = ?
  `);
  stmt.run(studentId, subject);
  return { success: true };
}

function getWeekSchedules(weekStart) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT s.*, 
           st.name as student_name, 
           t.name as teacher_name
    FROM schedules s
    LEFT JOIN students st ON s.student_id = st.id
    LEFT JOIN teachers t ON s.teacher_id = t.id
    WHERE s.week_start_date = ?
  `);
  return stmt.all(weekStart);
}

function getAllStudentSchedules(studentId, weekStartDate) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT COUNT(*) as total
    FROM schedules
    WHERE student_id = ? AND week_start_date <= ?
  `);
  const result = stmt.get(studentId, weekStartDate);
  return result.total || 0;
}

function checkClassroomLimit(weekStartDate, dayOfWeek, timeSlot, courseType) {
  const db = getDatabase();
  
  // 统计该时段非网课的课程数量
  const stmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM schedules
    WHERE week_start_date = ? 
      AND day_of_week = ? 
      AND time_slot = ?
      AND (course_type IS NULL OR course_type != '网课')
  `);
  
  const result = stmt.get(weekStartDate, dayOfWeek, timeSlot);
  const currentCount = result.count || 0;
  
  // 如果是网课，总是允许
  if (courseType === '网课') {
    return { allowed: true, currentCount };
  }
  
  // 如果非网课且已有5节，不允许
  if (currentCount >= 5) {
    return { allowed: false, currentCount, isLimitReached: true };
  }
  
  return { allowed: true, currentCount };
}

module.exports = {
  getSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  getStudentTeacherSubjects,
  setStudentTeacherSubject,
  deleteStudentTeacherSubject,
  getWeekSchedules,
  getAllStudentSchedules,
  checkClassroomLimit,
};
