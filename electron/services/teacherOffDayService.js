const { getDatabase } = require('../database/connection');

function getTeacherOffDays(weekStartDate) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM teacher_off_days
    WHERE week_start_date = ?
  `);
  return stmt.all(weekStartDate);
}

function setTeacherOffDay(teacherId, weekStartDate, dayOfWeek, timeSlot) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO teacher_off_days (teacher_id, week_start_date, day_of_week, time_slot)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(teacherId, weekStartDate, dayOfWeek, timeSlot);
  return { success: true };
}

function removeTeacherOffDay(teacherId, weekStartDate, dayOfWeek, timeSlot) {
  const db = getDatabase();
  const stmt = db.prepare(`
    DELETE FROM teacher_off_days
    WHERE teacher_id = ? AND week_start_date = ? AND day_of_week = ? AND time_slot = ?
  `);
  stmt.run(teacherId, weekStartDate, dayOfWeek, timeSlot);
  return { success: true };
}

function isOffDay(teacherId, weekStartDate, dayOfWeek, timeSlot) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM teacher_off_days
    WHERE teacher_id = ? AND week_start_date = ? AND day_of_week = ? AND time_slot = ?
  `);
  const result = stmt.get(teacherId, weekStartDate, dayOfWeek, timeSlot);
  return result.count > 0;
}

function toggleTeacherOffDay(teacherId, weekStartDate, dayOfWeek, timeSlot) {
  const db = getDatabase();
  const isOff = isOffDay(teacherId, weekStartDate, dayOfWeek, timeSlot);
  if (isOff) {
    removeTeacherOffDay(teacherId, weekStartDate, dayOfWeek, timeSlot);
    return { success: true, isOffDay: false };
  } else {
    setTeacherOffDay(teacherId, weekStartDate, dayOfWeek, timeSlot);
    return { success: true, isOffDay: true };
  }
}

// 批量设置休息日（上午1-4，下午5-8，晚上9-10，全天1-10）
function setBatchOffDay(teacherId, weekStartDate, dayOfWeek, period) {
  const db = getDatabase();
  
  // 先清除该天的所有休息日
  const deleteStmt = db.prepare(`
    DELETE FROM teacher_off_days
    WHERE teacher_id = ? AND week_start_date = ? AND day_of_week = ?
  `);
  deleteStmt.run(teacherId, weekStartDate, dayOfWeek);
  
  if (!period || period === 'none') {
    return { success: true, period: null };
  }
  
  // 根据period确定时间段
  let slots = [];
  switch (period) {
    case 'morning':   // 上午 1-4
      slots = [1, 2, 3, 4];
      break;
    case 'afternoon': // 下午 5-8
      slots = [5, 6, 7, 8];
      break;
    case 'evening':   // 晚上 9-10
      slots = [9, 10];
      break;
    case 'allday':    // 全天 1-10
      slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      break;
  }
  
  const insertStmt = db.prepare(`
    INSERT INTO teacher_off_days (teacher_id, week_start_date, day_of_week, time_slot)
    VALUES (?, ?, ?, ?)
  `);
  
  slots.forEach(slot => {
    insertStmt.run(teacherId, weekStartDate, dayOfWeek, slot);
  });
  
  return { success: true, period };
}

// 获取某天的休息时段类型
function getDayOffPeriod(teacherId, weekStartDate, dayOfWeek) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT time_slot FROM teacher_off_days
    WHERE teacher_id = ? AND week_start_date = ? AND day_of_week = ?
    ORDER BY time_slot
  `);
  const slots = stmt.all(teacherId, weekStartDate, dayOfWeek).map(r => r.time_slot);
  
  if (slots.length === 0) return null;
  
  const slotsStr = slots.join(',');
  if (slotsStr === '1,2,3,4,5,6,7,8,9,10') return 'allday';
  if (slotsStr === '1,2,3,4') return 'morning';
  if (slotsStr === '5,6,7,8') return 'afternoon';
  if (slotsStr === '9,10') return 'evening';
  
  return 'custom'; // 自定义时段
}

module.exports = {
  getTeacherOffDays,
  setTeacherOffDay,
  removeTeacherOffDay,
  isOffDay,
  toggleTeacherOffDay,
  setBatchOffDay,
  getDayOffPeriod,
};
