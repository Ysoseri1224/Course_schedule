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
          time_slot INTEGER NOT NULL,
          FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
          UNIQUE(teacher_id, week_start_date, day_of_week, time_slot)
        );

        CREATE TABLE IF NOT EXISTS student_available_times (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          week_start_date TEXT NOT NULL,
          day_of_week INTEGER NOT NULL,
          time_slot INTEGER NOT NULL,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          UNIQUE(student_id, week_start_date, day_of_week, time_slot)
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

        CREATE TABLE IF NOT EXISTS classrooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_number TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'unavailable', 'self-study')),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_schedules_week ON schedules(week_start_date);
        CREATE INDEX IF NOT EXISTS idx_schedules_student ON schedules(student_id);
        CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON schedules(teacher_id);
        CREATE INDEX IF NOT EXISTS idx_teacher_off_days ON teacher_off_days(teacher_id, week_start_date);
        CREATE INDEX IF NOT EXISTS idx_student_available_times ON student_available_times(student_id);
        CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
        CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(created_at);
      `);

      // 数据库迁移：检查并添加teacher_off_days表的time_slot列
      try {
        const tableInfo = db.prepare("PRAGMA table_info(teacher_off_days)").all();
        const hasTimeSlot = tableInfo.some(col => col.name === 'time_slot');
        if (!hasTimeSlot) {
          console.log('Migrating teacher_off_days table: adding time_slot column...');
          db.exec(`
            DROP TABLE IF EXISTS teacher_off_days;
            CREATE TABLE teacher_off_days (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              teacher_id INTEGER NOT NULL,
              week_start_date TEXT NOT NULL,
              day_of_week INTEGER NOT NULL,
              time_slot INTEGER NOT NULL,
              FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
              UNIQUE(teacher_id, week_start_date, day_of_week, time_slot)
            );
          `);
          console.log('Migration completed: teacher_off_days table rebuilt with time_slot');
        }
      } catch (migrationError) {
        console.error('Migration error:', migrationError.message);
      }

      // 数据库迁移：为student_available_times表添加week_start_date列
      try {
        const tableInfo = db.prepare("PRAGMA table_info(student_available_times)").all();
        const hasWeekStartDate = tableInfo.some(col => col.name === 'week_start_date');
        if (!hasWeekStartDate) {
          console.log('Migrating student_available_times table: adding week_start_date column...');
          db.exec(`
            CREATE TABLE student_available_times_new (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              student_id INTEGER NOT NULL,
              week_start_date TEXT NOT NULL,
              day_of_week INTEGER NOT NULL,
              time_slot INTEGER NOT NULL,
              FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
              UNIQUE(student_id, week_start_date, day_of_week, time_slot)
            );
            DROP TABLE IF EXISTS student_available_times;
            ALTER TABLE student_available_times_new RENAME TO student_available_times;
            CREATE INDEX IF NOT EXISTS idx_student_available_times ON student_available_times(student_id, week_start_date);
          `);
          console.log('Migration completed: student_available_times table rebuilt with week_start_date');
        }
      } catch (migrationError) {
        console.error('Migration error:', migrationError.message);
      }

      // 数据库迁移：扩展students表结构（添加详细信息字段）
      try {
        const studentTableInfo = db.prepare("PRAGMA table_info(students)").all();
        const hasGender = studentTableInfo.some(col => col.name === 'gender');
        
        if (!hasGender) {
          console.log('Migrating students table: adding detailed fields...');
          db.exec(`
            ALTER TABLE students ADD COLUMN gender TEXT;
            ALTER TABLE students ADD COLUMN phone TEXT;
            ALTER TABLE students ADD COLUMN english_level TEXT;
            ALTER TABLE students ADD COLUMN school TEXT;
            ALTER TABLE students ADD COLUMN target_score REAL;
            ALTER TABLE students ADD COLUMN father_name TEXT;
            ALTER TABLE students ADD COLUMN father_phone TEXT;
            ALTER TABLE students ADD COLUMN mother_name TEXT;
            ALTER TABLE students ADD COLUMN mother_phone TEXT;
            ALTER TABLE students ADD COLUMN status TEXT DEFAULT '意向学员';
            ALTER TABLE students ADD COLUMN course_type TEXT;
            ALTER TABLE students ADD COLUMN completed_hours INTEGER DEFAULT 0;
            ALTER TABLE students ADD COLUMN cancelled_hours INTEGER DEFAULT 0;
            ALTER TABLE students ADD COLUMN bank_account TEXT;
            ALTER TABLE students ADD COLUMN tuition_amount REAL;
            ALTER TABLE students ADD COLUMN payment_status TEXT DEFAULT '未完成';
          `);
          console.log('Migration completed: students table extended');
        }
      } catch (migrationError) {
        console.error('Student migration error:', migrationError.message);
      }

      // 数据库迁移：扩展teachers表结构（添加账号信息字段）
      try {
        const teacherTableInfo = db.prepare("PRAGMA table_info(teachers)").all();
        const hasUsername = teacherTableInfo.some(col => col.name === 'username');
        
        if (!hasUsername) {
          console.log('Migrating teachers table: adding account fields...');
          db.exec(`
            ALTER TABLE teachers ADD COLUMN username TEXT UNIQUE;
            ALTER TABLE teachers ADD COLUMN password TEXT;
            ALTER TABLE teachers ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user'));
            ALTER TABLE teachers ADD COLUMN phone TEXT;
            ALTER TABLE teachers ADD COLUMN email TEXT;
          `);
          console.log('Migration completed: teachers table extended');
        }
      } catch (migrationError) {
        console.error('Teacher migration error:', migrationError.message);
      }

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
