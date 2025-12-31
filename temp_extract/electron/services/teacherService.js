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

module.exports = {
  getAllTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
};
