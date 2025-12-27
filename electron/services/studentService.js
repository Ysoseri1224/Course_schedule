const { getDatabase } = require('../database/connection');

function getAllStudents() {
  const db = getDatabase();
  const students = db.prepare('SELECT * FROM students ORDER BY created_at DESC').all();
  return students;
}

function addStudent(student) {
  const db = getDatabase();
  const stmt = db.prepare('INSERT INTO students (name, total_hours, start_date, end_date) VALUES (?, ?, ?, ?)');
  const result = stmt.run(student.name, student.totalHours || 0, student.startDate || null, student.endDate || null);
  return { 
    id: result.lastInsertRowid, 
    name: student.name,
    total_hours: student.totalHours || 0,
    start_date: student.startDate || null,
    end_date: student.endDate || null
  };
}

function updateStudent(id, student) {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE students SET name = ?, total_hours = ?, start_date = ?, end_date = ? WHERE id = ?');
  stmt.run(student.name, student.totalHours || 0, student.startDate || null, student.endDate || null, id);
  return { 
    id, 
    name: student.name,
    total_hours: student.totalHours || 0,
    start_date: student.startDate || null,
    end_date: student.endDate || null
  };
}

function deleteStudent(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM students WHERE id = ?');
  stmt.run(id);
  return { success: true };
}

module.exports = {
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
};
