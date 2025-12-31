const { getDatabase } = require('../database/connection');

function runManualMigration() {
  const db = getDatabase();
  const results = {
    students: { success: false, message: '' },
    teachers: { success: false, message: '' }
  };

  // 迁移students表
  try {
    const studentTableInfo = db.prepare("PRAGMA table_info(students)").all();
    const hasGender = studentTableInfo.some(col => col.name === 'gender');
    
    if (!hasGender) {
      console.log('Manual migration: Adding fields to students table...');
      
      // 一个一个添加字段，避免批量失败
      const fieldsToAdd = [
        'gender TEXT',
        'phone TEXT',
        'english_level TEXT',
        'school TEXT',
        'target_score REAL',
        'father_name TEXT',
        'father_phone TEXT',
        'mother_name TEXT',
        'mother_phone TEXT',
        "status TEXT DEFAULT '意向学员'",
        'course_type TEXT',
        'completed_hours INTEGER DEFAULT 0',
        'cancelled_hours INTEGER DEFAULT 0',
        'bank_account TEXT',
        'tuition_amount REAL',
        "payment_status TEXT DEFAULT '未完成'"
      ];
      
      for (const field of fieldsToAdd) {
        try {
          const [fieldName] = field.split(' ');
          const exists = studentTableInfo.some(col => col.name === fieldName);
          if (!exists) {
            db.prepare(`ALTER TABLE students ADD COLUMN ${field}`).run();
            console.log(`  Added column: ${fieldName}`);
          }
        } catch (err) {
          console.error(`  Failed to add field ${field}:`, err.message);
        }
      }
      
      results.students.success = true;
      results.students.message = '学员表字段添加成功';
    } else {
      results.students.success = true;
      results.students.message = '学员表已包含扩展字段，无需迁移';
    }
  } catch (error) {
    console.error('Students table migration error:', error);
    results.students.message = `学员表迁移失败: ${error.message}`;
  }

  // 迁移teachers表
  try {
    const teacherTableInfo = db.prepare("PRAGMA table_info(teachers)").all();
    const hasUsername = teacherTableInfo.some(col => col.name === 'username');
    
    if (!hasUsername) {
      console.log('Manual migration: Adding fields to teachers table...');
      
      const fieldsToAdd = [
        'username TEXT',
        'password TEXT',
        "role TEXT DEFAULT 'user'",
        'phone TEXT',
        'email TEXT'
      ];
      
      for (const field of fieldsToAdd) {
        try {
          const [fieldName] = field.split(' ');
          const exists = teacherTableInfo.some(col => col.name === fieldName);
          if (!exists) {
            db.prepare(`ALTER TABLE teachers ADD COLUMN ${field}`).run();
            console.log(`  Added column: ${fieldName}`);
          }
        } catch (err) {
          console.error(`  Failed to add field ${field}:`, err.message);
        }
      }
      
      results.teachers.success = true;
      results.teachers.message = '教师表字段添加成功';
    } else {
      results.teachers.success = true;
      results.teachers.message = '教师表已包含扩展字段，无需迁移';
    }
  } catch (error) {
    console.error('Teachers table migration error:', error);
    results.teachers.message = `教师表迁移失败: ${error.message}`;
  }

  console.log('Manual migration completed:', results);
  return results;
}

module.exports = {
  runManualMigration,
};
