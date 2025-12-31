const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getStudents: () => ipcRenderer.invoke('get-students'),
  addStudent: (data) => ipcRenderer.invoke('add-student', data),
  updateStudent: (data) => ipcRenderer.invoke('update-student', data),
  deleteStudent: (data) => ipcRenderer.invoke('delete-student', data),
  
  getTeachers: () => ipcRenderer.invoke('get-teachers'),
  addTeacher: (data) => ipcRenderer.invoke('add-teacher', data),
  updateTeacher: (data) => ipcRenderer.invoke('update-teacher', data),
  deleteTeacher: (data) => ipcRenderer.invoke('delete-teacher', data),
  
  getSchedules: (weekStart) => ipcRenderer.invoke('get-schedules', weekStart),
  addSchedule: (schedule) => ipcRenderer.invoke('add-schedule', schedule),
  updateSchedule: (id, schedule) => ipcRenderer.invoke('update-schedule', id, schedule),
  deleteSchedule: (id) => ipcRenderer.invoke('delete-schedule', id),
  
  getStudentTeacherSubjects: (studentId) => ipcRenderer.invoke('get-student-teacher-subjects', studentId),
  setStudentTeacherSubject: (studentId, teacherId, subject) => 
    ipcRenderer.invoke('set-student-teacher-subject', studentId, teacherId, subject),
  
  getWeekSchedules: (weekStart) => ipcRenderer.invoke('get-week-schedules', weekStart),
  getAllStudentSchedules: (studentId, weekStartDate) => ipcRenderer.invoke('get-all-student-schedules', studentId, weekStartDate),
  
  getTeacherOffDays: (weekStartDate) => ipcRenderer.invoke('get-teacher-off-days', weekStartDate),
  setTeacherOffDay: (teacherId, weekStartDate, dayOfWeek) => ipcRenderer.invoke('set-teacher-off-day', teacherId, weekStartDate, dayOfWeek),
  removeTeacherOffDay: (teacherId, weekStartDate, dayOfWeek) => ipcRenderer.invoke('remove-teacher-off-day', teacherId, weekStartDate, dayOfWeek),
  
  exportSchedule: (data) => ipcRenderer.invoke('export-schedule', data),
  
  // 用户管理
  login: (username, password) => ipcRenderer.invoke('login', { username, password }),
  getAllUsers: () => ipcRenderer.invoke('get-all-users'),
  createUser: (username, password, role) => ipcRenderer.invoke('create-user', { username, password, role }),
  deleteUser: (id) => ipcRenderer.invoke('delete-user', id),
  changePassword: (userId, newPassword) => ipcRenderer.invoke('change-password', { userId, newPassword }),
  getLogs: (limit) => ipcRenderer.invoke('get-logs', limit),
  clearLogs: () => ipcRenderer.invoke('clear-logs'),
  
  insertTestData: () => ipcRenderer.invoke('insert-test-data'),
  deleteAllData: () => ipcRenderer.invoke('delete-all-data'),
});
