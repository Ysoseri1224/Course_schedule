const { ipcMain } = require('electron');
const { getDatabase } = require('../database/connection');
const studentService = require('../services/studentService');
const teacherService = require('../services/teacherService');
const scheduleService = require('../services/scheduleService');
const teacherOffDayService = require('../services/teacherOffDayService');
const studentAvailableTimeService = require('../services/studentAvailableTimeService');
const autoScheduleService = require('../services/autoScheduleService');
const userService = require('../services/userService');
const testDataService = require('../services/testDataService');
const dataService = require('../services/dataService');

function registerIpcHandlers() {
  ipcMain.handle('get-students', () => studentService.getAllStudents());
  ipcMain.handle('add-student', (event, { student, user }) => {
    const result = studentService.addStudent(student);
    if (user) {
      userService.logUserAction(user.id, user.username, `添加了学生 ${student.name}`);
    }
    return result;
  });
  ipcMain.handle('update-student', (event, { id, student, user }) => {
    const result = studentService.updateStudent(id, student);
    if (user) {
      userService.logUserAction(user.id, user.username, `修改了学生 ${student.name} 的信息`);
    }
    return result;
  });
  ipcMain.handle('delete-student', (event, { id, user, studentName }) => {
    const result = studentService.deleteStudent(id);
    if (user && studentName) {
      userService.logUserAction(user.id, user.username, `删除了学生 ${studentName}`);
    }
    return result;
  });
  
  ipcMain.handle('get-teachers', () => teacherService.getAllTeachers());
  ipcMain.handle('add-teacher', (event, { teacher, user }) => {
    const result = teacherService.addTeacher(teacher);
    if (user) {
      userService.logUserAction(user.id, user.username, `添加了教师 ${teacher.name}`);
    }
    return result;
  });
  ipcMain.handle('update-teacher', (event, { id, teacher, user }) => {
    const result = teacherService.updateTeacher(id, teacher);
    if (user) {
      userService.logUserAction(user.id, user.username, `修改了教师 ${teacher.name} 的信息`);
    }
    return result;
  });
  ipcMain.handle('delete-teacher', (event, { id, user, teacherName }) => {
    const result = teacherService.deleteTeacher(id);
    if (user && teacherName) {
      userService.logUserAction(user.id, user.username, `删除了教师 ${teacherName}`);
    }
    return result;
  });
  ipcMain.handle('get-teacher-statistics', (event, teacherId) => 
    teacherService.getTeacherStatistics(teacherId));
  
  ipcMain.handle('get-schedules', (event, weekStart) => scheduleService.getSchedules(weekStart));
  ipcMain.handle('add-schedule', (event, schedule) => scheduleService.addSchedule(schedule));
  ipcMain.handle('update-schedule', (event, id, schedule) => scheduleService.updateSchedule(id, schedule));
  ipcMain.handle('delete-schedule', (event, id) => scheduleService.deleteSchedule(id));
  ipcMain.handle('check-classroom-limit', (event, weekStartDate, dayOfWeek, timeSlot, courseType) => 
    scheduleService.checkClassroomLimit(weekStartDate, dayOfWeek, timeSlot, courseType));
  
  ipcMain.handle('get-student-teacher-subjects', (event, studentId) => 
    scheduleService.getStudentTeacherSubjects(studentId));
  ipcMain.handle('set-student-teacher-subject', (event, studentId, teacherId, subject) => 
    scheduleService.setStudentTeacherSubject(studentId, teacherId, subject));
  
  ipcMain.handle('get-week-schedules', (event, weekStart) => 
    scheduleService.getWeekSchedules(weekStart));
  
  ipcMain.handle('get-all-student-schedules', (event, studentId, weekStartDate) => 
    scheduleService.getAllStudentSchedules(studentId, weekStartDate));
  
  ipcMain.handle('get-teacher-off-days', (event, weekStartDate) => 
    teacherOffDayService.getTeacherOffDays(weekStartDate));
  ipcMain.handle('set-teacher-off-day', (event, teacherId, weekStartDate, dayOfWeek, timeSlot) => 
    teacherOffDayService.setTeacherOffDay(teacherId, weekStartDate, dayOfWeek, timeSlot));
  ipcMain.handle('remove-teacher-off-day', (event, teacherId, weekStartDate, dayOfWeek, timeSlot) => 
    teacherOffDayService.removeTeacherOffDay(teacherId, weekStartDate, dayOfWeek, timeSlot));
  ipcMain.handle('toggle-teacher-off-day', (event, teacherId, weekStartDate, dayOfWeek, timeSlot) => 
    teacherOffDayService.toggleTeacherOffDay(teacherId, weekStartDate, dayOfWeek, timeSlot));
  ipcMain.handle('set-batch-off-day', (event, teacherId, weekStartDate, dayOfWeek, period) => 
    teacherOffDayService.setBatchOffDay(teacherId, weekStartDate, dayOfWeek, period));
  ipcMain.handle('get-day-off-period', (event, teacherId, weekStartDate, dayOfWeek) => 
    teacherOffDayService.getDayOffPeriod(teacherId, weekStartDate, dayOfWeek));
  
  // 学生可排课时段
  ipcMain.handle('get-student-available-times', (event, studentId) => 
    studentAvailableTimeService.getStudentAvailableTimes(studentId));
  ipcMain.handle('set-student-available-times', (event, studentId, timesArray) => 
    studentAvailableTimeService.setStudentAvailableTimes(studentId, timesArray));
  
  // 自动排课
  ipcMain.handle('generate-schedule-options', (event, params) => 
    autoScheduleService.generateScheduleOptions(params));
  ipcMain.handle('apply-schedule-option', (event, params) => 
    autoScheduleService.applyScheduleOption(params));
  
  // 用户认证
  ipcMain.handle('login', async (event, { username, password }) => {
    try {
      return userService.loginUser(username, password);
    } catch (error) {
      userService.logError('error', 'Login failed', error.message);
      throw error;
    }
  });

  ipcMain.handle('get-all-users', () => userService.getAllUsers());
  
  ipcMain.handle('create-user', async (event, { username, password, role }) => {
    try {
      return userService.createUser(username, password, role);
    } catch (error) {
      userService.logError('error', 'Create user failed', error.message);
      throw error;
    }
  });

  ipcMain.handle('delete-user', async (event, id) => {
    try {
      return userService.deleteUser(id);
    } catch (error) {
      userService.logError('error', 'Delete user failed', error.message);
      throw error;
    }
  });

  ipcMain.handle('change-password', async (event, { userId, newPassword }) => {
    try {
      return userService.changePassword(userId, newPassword);
    } catch (error) {
      userService.logError('error', 'Change password failed', error.message);
      throw error;
    }
  });

  ipcMain.handle('get-logs', (event, limit) => userService.getLogs(limit));
  
  ipcMain.handle('clear-logs', () => userService.clearLogs());

  ipcMain.handle('insert-test-data', async () => {
    try {
      return testDataService.insertTestData();
    } catch (error) {
      userService.logError('error', 'Insert test data failed', error.message);
      throw error;
    }
  });

  ipcMain.handle('delete-all-data', async () => {
    try {
      return dataService.deleteAllData();
    } catch (error) {
      userService.logError('error', 'Delete all data failed', error.message);
      throw error;
    }
  });
}

module.exports = {
  registerIpcHandlers,
};
