const Database = require('better-sqlite3');
const path = require('path');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');

dayjs.extend(isoWeek);

const dbPath = path.join(
  process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + "/.local/share"),
  'schedule-system',
  'schedule-data.db'
);

console.log('Database path:', dbPath);

const db = new Database(dbPath);

const currentWeekStart = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
const nextWeekStart = dayjs().startOf('isoWeek').add(1, 'week').format('YYYY-MM-DD');

console.log('Current week start:', currentWeekStart);
console.log('Next week start:', nextWeekStart);

try {
  db.exec('BEGIN TRANSACTION');

  // 1. 插入学生数据
  const studentInsert = db.prepare(`
    INSERT INTO students (name, total_hours, start_date, end_date) 
    VALUES (?, ?, ?, ?)
  `);

  const students = [
    ['张三', 100, '2024-09-01', '2025-06-30'],
    ['李四', 80, '2024-10-01', '2025-05-31'],
    ['王五', 120, '2024-08-15', '2025-07-15'],
    ['赵六', 60, '2024-11-01', '2025-04-30'],
  ];

  students.forEach(student => {
    studentInsert.run(...student);
  });

  console.log('✓ 插入4个学生');

  // 2. 插入教师数据
  const teacherInsert = db.prepare(`
    INSERT INTO teachers (name, subjects) 
    VALUES (?, ?)
  `);

  const teachers = [
    ['王老师', '写作,口语'],
    ['李老师', '听力,阅读'],
    ['陈老师', '写作,阅读'],
    ['刘老师', '口语,听力'],
  ];

  teachers.forEach(teacher => {
    teacherInsert.run(...teacher);
  });

  console.log('✓ 插入4个教师');

  // 3. 插入学生-教师-科目关联
  const stsInsert = db.prepare(`
    INSERT INTO student_teacher_subjects (student_id, teacher_id, subject) 
    VALUES (?, ?, ?)
  `);

  const studentTeacherSubjects = [
    // 张三 (student_id: 1)
    [1, 1, '写作'],
    [1, 1, '口语'],
    [1, 2, '听力'],
    [1, 2, '阅读'],
    
    // 李四 (student_id: 2)
    [2, 3, '写作'],
    [2, 4, '口语'],
    [2, 2, '听力'],
    [2, 3, '阅读'],
    
    // 王五 (student_id: 3)
    [3, 1, '写作'],
    [3, 4, '口语'],
    [3, 4, '听力'],
    [3, 2, '阅读'],
    
    // 赵六 (student_id: 4)
    [4, 3, '写作'],
    [4, 1, '口语'],
    [4, 2, '听力'],
    [4, 3, '阅读'],
  ];

  studentTeacherSubjects.forEach(sts => {
    stsInsert.run(...sts);
  });

  console.log('✓ 插入学生-教师-科目关联');

  // 4. 插入排课数据（本周）
  const scheduleInsert = db.prepare(`
    INSERT INTO schedules (student_id, teacher_id, subject, day_of_week, time_slot, week_start_date, note, course_type) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const schedules = [
    // 本周 - 张三的课程
    [1, 1, '写作', 1, 1, currentWeekStart, '', '一对一'],
    [1, 1, '口语', 1, 3, currentWeekStart, '网课', '网课'],
    [1, 2, '听力', 2, 2, currentWeekStart, '', '一对一'],
    [1, 2, '阅读', 3, 4, currentWeekStart, '', '班课'],
    [1, 1, '写作', 4, 1, currentWeekStart, '作文专项', '一对一'],
    [1, 2, '听力', 5, 5, currentWeekStart, '', '一对一'],
    
    // 本周 - 李四的课程
    [2, 3, '写作', 1, 2, currentWeekStart, '', '一对一'],
    [2, 4, '口语', 2, 1, currentWeekStart, '口语强化', '一对一'],
    [2, 2, '听力', 2, 3, currentWeekStart, '', '网课'],
    [2, 3, '阅读', 3, 2, currentWeekStart, '', '班课'],
    [2, 4, '口语', 4, 4, currentWeekStart, '', '一对一'],
    [2, 2, '听力', 5, 1, currentWeekStart, '', '一对一'],
    
    // 本周 - 王五的课程
    [3, 1, '写作', 1, 4, currentWeekStart, '', '班课'],
    [3, 4, '口语', 2, 5, currentWeekStart, '', '一对一'],
    [3, 4, '听力', 3, 1, currentWeekStart, '网课', '网课'],
    [3, 2, '阅读', 3, 3, currentWeekStart, '', '一对一'],
    [3, 1, '写作', 4, 2, currentWeekStart, '写作训练', '一对一'],
    [3, 4, '口语', 5, 4, currentWeekStart, '', '一对一'],
    
    // 本周 - 赵六的课程
    [4, 3, '写作', 1, 5, currentWeekStart, '', '一对一'],
    [4, 1, '口语', 2, 4, currentWeekStart, '', '班课'],
    [4, 2, '听力', 3, 5, currentWeekStart, '', '一对一'],
    [4, 3, '阅读', 4, 3, currentWeekStart, '阅读理解', '一对一'],
    [4, 1, '口语', 5, 2, currentWeekStart, '', '一对一'],
    
    // 下周 - 部分课程
    [1, 1, '写作', 1, 1, nextWeekStart, '', '一对一'],
    [1, 2, '听力', 2, 2, nextWeekStart, '', '一对一'],
    [2, 3, '写作', 1, 2, nextWeekStart, '', '一对一'],
    [2, 4, '口语', 3, 1, nextWeekStart, '', '一对一'],
    [3, 1, '写作', 2, 4, nextWeekStart, '', '班课'],
    [4, 3, '阅读', 3, 3, nextWeekStart, '', '一对一'],
  ];

  schedules.forEach(schedule => {
    scheduleInsert.run(...schedule);
  });

  console.log('✓ 插入排课数据（本周和下周）');

  // 5. 插入教师休息日（本周）
  const offDayInsert = db.prepare(`
    INSERT INTO teacher_off_days (teacher_id, week_start_date, day_of_week, time_slot) 
    VALUES (?, ?, ?, ?)
  `);

  const offDays = [
    [1, currentWeekStart, 6, 7],  // 王老师周六第7节休息
    [1, currentWeekStart, 6, 8],  // 王老师周六第8节休息
    [2, currentWeekStart, 7, 9],  // 李老师周日第9节休息
    [2, currentWeekStart, 7, 10], // 李老师周日第10节休息
    [3, nextWeekStart, 5, 5],     // 陈老师下周五第5节休息
  ];

  offDays.forEach(offDay => {
    offDayInsert.run(...offDay);
  });

  console.log('✓ 插入教师休息日');

  db.exec('COMMIT');
  
  console.log('\n========================================');
  console.log('✅ 测试数据插入成功！');
  console.log('========================================');
  console.log('插入内容：');
  console.log('- 4个学生（张三、李四、王五、赵六）');
  console.log('- 4个教师（王老师、李老师、陈老师、刘老师）');
  console.log('- 16个学生-教师-科目关联');
  console.log('- ' + schedules.length + ' 个排课记录（本周和下周）');
  console.log('- 3个教师休息日');
  console.log('========================================');
  
} catch (error) {
  db.exec('ROLLBACK');
  console.error('❌ 插入测试数据失败:', error);
} finally {
  db.close();
}
