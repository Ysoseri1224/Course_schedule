import { create } from 'zustand';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export const useScheduleStore = create((set, get) => ({
  students: [],
  teachers: [],
  schedules: [],
  currentWeekStart: dayjs().startOf('isoWeek').format('YYYY-MM-DD'),
  activeTab: 'students',
  activeStudentId: null,
  activeTeacherId: null,

  loadStudents: async () => {
    const students = await window.api.getStudents();
    set({ students, activeStudentId: students[0]?.id || null });
  },

  addStudent: async (student, user) => {
    const newStudent = await window.api.addStudent({ student, user });
    set(state => ({
      students: [newStudent, ...state.students],
      activeStudentId: newStudent.id,
    }));
  },

  updateStudent: async (id, student, user) => {
    const result = await window.api.updateStudent({ id, student, user });
    set(state => ({
      students: state.students.map(s => s.id === id ? { ...s, ...result } : s),
    }));
  },

  deleteStudent: async (id, user, studentName) => {
    await window.api.deleteStudent({ id, user, studentName });
    set(state => {
      const newStudents = state.students.filter(s => s.id !== id);
      return {
        students: newStudents,
        activeStudentId: newStudents[0]?.id || null,
      };
    });
  },

  loadTeachers: async () => {
    const teachers = await window.api.getTeachers();
    set({ teachers, activeTeacherId: teachers[0]?.id || null });
  },

  addTeacher: async (teacher, user) => {
    const newTeacher = await window.api.addTeacher({ teacher, user });
    set(state => ({
      teachers: [newTeacher, ...state.teachers],
      activeTeacherId: newTeacher.id,
    }));
  },

  updateTeacher: async (id, teacher, user) => {
    await window.api.updateTeacher({ id, teacher, user });
    set(state => ({
      teachers: state.teachers.map(t => t.id === id ? { ...t, ...teacher } : t),
    }));
  },

  deleteTeacher: async (id, user, teacherName) => {
    await window.api.deleteTeacher({ id, user, teacherName });
    set(state => {
      const newTeachers = state.teachers.filter(t => t.id !== id);
      return {
        teachers: newTeachers,
        activeTeacherId: newTeachers[0]?.id || null,
      };
    });
  },

  loadSchedules: async (weekStart) => {
    const schedules = await window.api.getSchedules(weekStart || get().currentWeekStart);
    set({ schedules });
  },

  addSchedule: async (schedule) => {
    const newSchedule = await window.api.addSchedule({
      ...schedule,
      weekStartDate: get().currentWeekStart,
    });
    await get().loadSchedules();
  },

  deleteSchedule: async (id) => {
    await window.api.deleteSchedule(id);
    await get().loadSchedules();
  },

  setCurrentWeek: (weekStart) => {
    set({ currentWeekStart: weekStart });
    get().loadSchedules(weekStart);
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setActiveStudent: (id) => {
    set({ activeStudentId: id });
  },

  setActiveTeacher: (id) => {
    set({ activeTeacherId: id });
  },
}));
