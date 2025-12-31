const { getDatabase } = require('../database/connection');
const dayjs = require('dayjs');

function insertTestData() {
  const db = getDatabase();
  
  try {
    // 清空现有数据
    db.prepare('DELETE FROM schedules').run();
    db.prepare('DELETE FROM teacher_off_days').run();
    db.prepare('DELETE FROM student_teacher_subjects').run();
    db.prepare('DELETE FROM students').run();
    db.prepare('DELETE FROM teachers').run();

    // 插入学生
    const students = [
      { name: '张三', total_hours: 60, start_date: '2025-01-01', end_date: '2025-06-30' },
      { name: '李四', total_hours: 80, start_date: '2025-01-01', end_date: '2025-06-30' },
      { name: '王五', total_hours: 40, start_date: '2025-02-01', end_date: '2025-05-31' },
      { name: '赵六', total_hours: 100, start_date: '2025-01-15', end_date: '2025-07-15' },
    ];

    const studentIds = [];
    for (const student of students) {
      const result = db.prepare('INSERT INTO students (name, total_hours, start_date, end_date) VALUES (?, ?, ?, ?)').run(
        student.name,
        student.total_hours,
        student.start_date,
        student.end_date
      );
      studentIds.push(result.lastInsertRowid);
    }

    // 插入教师
    const teachers = [
      { name: 'Emma', subjects: ['Writing', 'Reading'] },
      { name: 'John', subjects: ['Listening', 'Speaking'] },
      { name: 'Sarah', subjects: ['Writing', 'Grammar'] },
      { name: 'Michael', subjects: ['Reading', 'Vocabulary'] },
    ];

    const teacherIds = [];
    for (const teacher of teachers) {
      const result = db.prepare('INSERT INTO teachers (name, subjects) VALUES (?, ?)').run(
        teacher.name,
        JSON.stringify(teacher.subjects)
      );
      teacherIds.push(result.lastInsertRowid);
    }

    // 建立学生-教师-科目关系
    const bindings = [
      { studentId: studentIds[0], teacherId: teacherIds[0], subject: 'Writing' },
      { studentId: studentIds[0], teacherId: teacherIds[1], subject: 'Listening' },
      { studentId: studentIds[1], teacherId: teacherIds[0], subject: 'Writing' },
      { studentId: studentIds[1], teacherId: teacherIds[3], subject: 'Reading' },
      { studentId: studentIds[2], teacherId: teacherIds[2], subject: 'Grammar' },
      { studentId: studentIds[3], teacherId: teacherIds[1], subject: 'Speaking' },
    ];

    for (const binding of bindings) {
      db.prepare('INSERT INTO student_teacher_subjects (student_id, teacher_id, subject) VALUES (?, ?, ?)').run(
        binding.studentId,
        binding.teacherId,
        binding.subject
      );
    }

    // 插入本周课程安排
    const weekStart = dayjs().startOf('isoWeek').format('YYYY-MM-DD');
    const schedules = [
      // 周一
      { studentId: studentIds[0], teacherId: teacherIds[0], dayOfWeek: 1, timeSlot: 1, subject: 'Writing', courseType: '-正课', note: '' },
      { studentId: studentIds[1], teacherId: teacherIds[0], dayOfWeek: 1, timeSlot: 2, subject: 'Writing', courseType: '-正课', note: '' },
      { studentId: studentIds[2], teacherId: teacherIds[2], dayOfWeek: 1, timeSlot: 5, subject: 'Grammar', courseType: '-辅导', note: '' },
      
      // 周二
      { studentId: studentIds[0], teacherId: teacherIds[1], dayOfWeek: 2, timeSlot: 3, subject: 'Listening', courseType: '-正课', note: '' },
      { studentId: studentIds[3], teacherId: teacherIds[1], dayOfWeek: 2, timeSlot: 6, subject: 'Speaking', courseType: '-正课', note: '' },
      
      // 周三
      { studentId: studentIds[1], teacherId: teacherIds[3], dayOfWeek: 3, timeSlot: 2, subject: 'Reading', courseType: '-正课', note: '' },
      { studentId: studentIds[0], teacherId: teacherIds[0], dayOfWeek: 3, timeSlot: 7, subject: 'Writing', courseType: '-辅导', note: '' },
      
      // 周四
      { studentId: studentIds[2], teacherId: teacherIds[2], dayOfWeek: 4, timeSlot: 4, subject: 'Grammar', courseType: '-正课', note: '' },
      { studentId: studentIds[3], teacherId: teacherIds[1], dayOfWeek: 4, timeSlot: 8, subject: 'Speaking', courseType: '-模考', note: '' },
      
      // 周五
      { studentId: studentIds[1], teacherId: teacherIds[0], dayOfWeek: 5, timeSlot: 1, subject: 'Writing', courseType: '-正课', note: '' },
      { studentId: studentIds[0], teacherId: teacherIds[1], dayOfWeek: 5, timeSlot: 9, subject: 'Listening', courseType: '-正课', note: '' },
    ];

    for (const schedule of schedules) {
      db.prepare('INSERT INTO schedules (student_id, teacher_id, week_start_date, day_of_week, time_slot, subject, course_type, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        schedule.studentId,
        schedule.teacherId,
        weekStart,
        schedule.dayOfWeek,
        schedule.timeSlot,
        schedule.subject,
        schedule.courseType,
        schedule.note
      );
    }

    // 插入教师休息日（Emma周日休息，John周六休息）
    db.prepare('INSERT INTO teacher_off_days (teacher_id, week_start_date, day_of_week) VALUES (?, ?, ?)').run(
      teacherIds[0],
      weekStart,
      7
    );
    
    db.prepare('INSERT INTO teacher_off_days (teacher_id, week_start_date, day_of_week) VALUES (?, ?, ?)').run(
      teacherIds[1],
      weekStart,
      6
    );

    console.log('Test data inserted successfully');
    return { success: true, message: '测试数据生成成功' };
  } catch (error) {
    console.error('Failed to insert test data:', error);
    throw error;
  }
}

module.exports = {
  insertTestData,
};
