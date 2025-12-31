const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let db = null;

function getDatabasePath() {
  const userDataPath = app.getPath('userData');
  
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  
  return path.join(userDataPath, 'schedule-data.db');
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    try {
      const dbPath = getDatabasePath();
      console.log('Database path:', dbPath);
      
      db = new Database(dbPath);
      
      db.pragma('journal_mode = WAL');
      
      db.exec(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          total_hours INTEGER DEFAULT 0,
          start_date TEXT,
          end_date TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS teachers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          subjects TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS student_teacher_subjects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          teacher_id INTEGER NOT NULL,
          subject TEXT NOT NULL,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
          UNIQUE(student_id, subject)
        );

        CREATE TABLE IF NOT EXISTS schedules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          teacher_id INTEGER NOT NULL,
          subject TEXT NOT NULL,
          day_of_week INTEGER NOT NULL,
          time_slot INTEGER NOT NULL,
          week_start_date TEXT NOT NULL,
          note TEXT,
          course_type TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS teacher_off_days (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          teacher_id INTEGER NOT NULL,
          week_start_date TEXT NOT NULL,
          day_of_week INTEGER NOT NULL,
          FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
          UNIQUE(teacher_id, week_start_date, day_of_week)
        );

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
          created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level TEXT NOT NULL CHECK(level IN ('info', 'warning', 'error')),
          message TEXT NOT NULL,
          details TEXT,
          user_id INTEGER,
          created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        CREATE INDEX IF NOT EXISTS idx_schedules_week ON schedules(week_start_date);
        CREATE INDEX IF NOT EXISTS idx_schedules_student ON schedules(student_id);
        CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON schedules(teacher_id);
        CREATE INDEX IF NOT EXISTS idx_teacher_off_days ON teacher_off_days(teacher_id, week_start_date);
        CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
        CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(created_at);
      `);

      // 插入默认管理员账号（如果不存在）
      const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('chuangjin');
      if (!existingAdmin) {
        const crypto = require('crypto');
        const hashedPassword = crypto.createHash('sha256').update('chuangjin').digest('hex');
        db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('chuangjin', hashedPassword, 'admin');
        console.log('Default admin user created');
      }
      
      console.log('Database initialized successfully');
      resolve(db);
    } catch (error) {
      console.error('Database initialization failed:', error);
      reject(error);
    }
  });
}

function getDatabase() {
  return db;
}

module.exports = {
  initDatabase,
  getDatabase,
};
