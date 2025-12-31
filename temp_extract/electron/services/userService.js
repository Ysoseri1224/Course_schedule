const { getDatabase } = require('../database/connection');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function loginUser(username, password) {
  const db = getDatabase();
  const hashedPassword = hashPassword(password);
  const user = db.prepare('SELECT id, username, role FROM users WHERE username = ? AND password = ?').get(username, hashedPassword);
  return user;
}

function getAllUsers() {
  const db = getDatabase();
  return db.prepare('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC').all();
}

function createUser(username, password, role = 'user') {
  const db = getDatabase();
  const hashedPassword = hashPassword(password);
  const result = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hashedPassword, role);
  return { id: result.lastInsertRowid, username, role };
}

function deleteUser(id) {
  const db = getDatabase();
  // 不允许删除管理员账号
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
  if (user && user.role === 'admin') {
    throw new Error('Cannot delete admin user');
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

function changePassword(userId, newPassword) {
  const db = getDatabase();
  const hashedPassword = hashPassword(newPassword);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);
}

function logError(level, message, details = null) {
  const db = getDatabase();
  db.prepare('INSERT INTO logs (level, message, details) VALUES (?, ?, ?)').run(level, message, details);
}

function logUserAction(userId, username, action, details = null) {
  const db = getDatabase();
  const message = `用户 ${username} ${action}`;
  // 先检查user_id列是否存在，如果不存在则添加
  try {
    const tableInfo = db.prepare("PRAGMA table_info(logs)").all();
    const hasUserIdColumn = tableInfo.some(col => col.name === 'user_id');
    if (!hasUserIdColumn) {
      db.prepare('ALTER TABLE logs ADD COLUMN user_id INTEGER').run();
    }
    db.prepare('INSERT INTO logs (level, message, details, user_id) VALUES (?, ?, ?, ?)').run('info', message, details, userId);
  } catch (e) {
    // 如果出错，尝试不带user_id插入
    db.prepare('INSERT INTO logs (level, message, details) VALUES (?, ?, ?)').run('info', message, details);
  }
}

function getLogs(limit = 100) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM logs ORDER BY created_at DESC LIMIT ?').all(limit);
}

function clearLogs() {
  const db = getDatabase();
  db.prepare('DELETE FROM logs').run();
}

module.exports = {
  loginUser,
  getAllUsers,
  createUser,
  deleteUser,
  changePassword,
  logError,
  logUserAction,
  getLogs,
  clearLogs,
};
