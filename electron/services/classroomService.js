const { getDatabase } = require('../database/connection');

function getAllClassrooms() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM classrooms ORDER BY room_number');
  return stmt.all();
}

function addClassroom(roomNumber, status = 'available') {
  const db = getDatabase();
  
  try {
    const stmt = db.prepare('INSERT INTO classrooms (room_number, status) VALUES (?, ?)');
    const result = stmt.run(roomNumber, status);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('该教室号已存在');
    }
    throw error;
  }
}

function updateClassroom(id, roomNumber, status) {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE classrooms SET room_number = ?, status = ? WHERE id = ?');
  stmt.run(roomNumber, status, id);
  return { success: true };
}

function deleteClassroom(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM classrooms WHERE id = ?');
  stmt.run(id);
  return { success: true };
}

function updateClassroomStatus(id, status) {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE classrooms SET status = ? WHERE id = ?');
  stmt.run(status, id);
  return { success: true };
}

module.exports = {
  getAllClassrooms,
  addClassroom,
  updateClassroom,
  deleteClassroom,
  updateClassroomStatus,
};
