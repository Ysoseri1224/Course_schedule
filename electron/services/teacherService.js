const { getDatabase } = require('../database/connection');

function getAllTeachers() {
  const db = getDatabase();
  const teachers = db.prepare('SELECT * FROM teachers ORDER BY created_at DESC').all();
  return teachers.map(t => {
    let subjects = [];
    if (t.subjects) {
      try {
        // 尝试解析JSON格式
        subjects = JSON.parse(t.subjects);
      } catch (e) {
        // 如果不是JSON，可能是逗号分隔的字符串，转换为数组
        subjects = t.subjects.split(',').map(s => s.trim()).filter(s => s);
      }
    }
    return {
      ...t,
      subjects,
    };
  });
}

function addTeacher(teacher) {
  const db = getDatabase();
  const stmt = db.prepare('INSERT INTO teachers (name, subjects) VALUES (?, ?)');
  const result = stmt.run(teacher.name, JSON.stringify(teacher.subjects || []));
  return { id: result.lastInsertRowid, ...teacher };
}

function updateTeacher(id, teacher) {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE teachers SET name = ?, subjects = ? WHERE id = ?');
  stmt.run(teacher.name, JSON.stringify(teacher.subjects || []), id);
  return { id, ...teacher };
}

function deleteTeacher(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM teachers WHERE id = ?');
  stmt.run(id);
  return { success: true };
}

function getTeacherStatistics(teacherId) {
  const db = getDatabase();
  
  // 先检查该教师是否有课程记录
  const totalCount = db.prepare('SELECT COUNT(*) as count FROM schedules WHERE teacher_id = ?').get(teacherId);
  console.log(`Teacher ${teacherId} total schedules:`, totalCount.count);
  
  // 获取年度统计（按年份分组）
  // 使用 substr 函数从 YYYY-MM-DD 格式中提取年份
  const yearlyStmt = db.prepare(`
    SELECT 
      substr(week_start_date, 1, 4) as year,
      COUNT(*) as total_hours
    FROM schedules
    WHERE teacher_id = ?
    GROUP BY year
    ORDER BY year DESC
  `);
  const yearlyStats = yearlyStmt.all(teacherId);
  console.log('Yearly stats:', yearlyStats);
  
  // 获取月度统计（最近12个月）
  // 使用 substr 函数从 YYYY-MM-DD 格式中提取年月
  const monthlyStmt = db.prepare(`
    SELECT 
      substr(week_start_date, 1, 7) as month,
      COUNT(*) as total_hours
    FROM schedules
    WHERE teacher_id = ?
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `);
  const monthlyStats = monthlyStmt.all(teacherId);
  console.log('Monthly stats:', monthlyStats);
  
  return {
    yearly: yearlyStats,
    monthly: monthlyStats,
  };
}

module.exports = {
  getAllTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherStatistics,
};
