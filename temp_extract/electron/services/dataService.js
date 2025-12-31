const { getDatabase } = require('../database/connection');

function deleteAllData() {
  const db = getDatabase();
  
  try {
    // 删除所有课表数据
    db.prepare('DELETE FROM schedules').run();
    db.prepare('DELETE FROM teacher_off_days').run();
    db.prepare('DELETE FROM student_teacher_subjects').run();
    db.prepare('DELETE FROM students').run();
    db.prepare('DELETE FROM teachers').run();
    
    console.log('All data deleted successfully');
    return { success: true, message: '所有数据已删除' };
  } catch (error) {
    console.error('Failed to delete all data:', error);
    throw error;
  }
}

module.exports = {
  deleteAllData,
};
