const { getDatabase } = require('../database/connection');
const { checkClassroomLimit } = require('./scheduleService');

function getStudentAvailableTimes(studentId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT day_of_week, time_slot 
    FROM student_available_times 
    WHERE student_id = ?
  `).all(studentId);
}

function getTeacherOffDays(weekStartDate) {
  const db = getDatabase();
  return db.prepare(`
    SELECT teacher_id, day_of_week, time_slot
    FROM teacher_off_days 
    WHERE week_start_date = ?
  `).all(weekStartDate);
}

function getStudentTeacherMap(studentId) {
  const db = getDatabase();
  return db.prepare(`
    SELECT subject, teacher_id
    FROM student_teacher_subjects
    WHERE student_id = ?
  `).all(studentId);
}

function getExistingSchedules(studentId, weekStartDate) {
  const db = getDatabase();
  return db.prepare(`
    SELECT day_of_week, time_slot, subject, teacher_id
    FROM schedules
    WHERE student_id = ? AND week_start_date = ?
  `).all(studentId, weekStartDate);
}

const VALID_SLOT_PAIRS = [
  [1, 2],   // 1st + 2nd
  [3, 4],   // 3rd + 4th
  [5, 6],   // 5th + 6th
  [7, 8],   // 7th + 8th
  [9, 10]   // 9th + 10th
];

function identifyConsecutiveSlots(availableSlots, teacherOffDays) {
  const offDaySet = new Set(
    teacherOffDays.map(off => `${off.day_of_week}-${off.time_slot}`)
  );
  
  const availableSet = new Set(
    availableSlots.map(slot => `${slot.day_of_week}-${slot.time_slot}`)
  );
  
  const consecutivePairs = [];
  
  for (let day = 0; day < 7; day++) {
    for (const [slot1, slot2] of VALID_SLOT_PAIRS) {
      const key1 = `${day}-${slot1}`;
      const key2 = `${day}-${slot2}`;
      
      if (availableSet.has(key1) && availableSet.has(key2) &&
          !offDaySet.has(key1) && !offDaySet.has(key2)) {
        consecutivePairs.push({
          day_of_week: day,
          start_slot: slot1,
          end_slot: slot2
        });
      }
    }
  }
  
  return consecutivePairs;
}

function backtrackSchedule(courseArrangements, consecutivePairs, existingSchedules, solutions, currentSolution, index, maxSolutions) {
  if (solutions.length >= maxSolutions) return;
  
  if (index >= courseArrangements.length) {
    solutions.push([...currentSolution]);
    return;
  }
  
  const course = courseArrangements[index];
  const slotsNeeded = course.hours / 2;
  
  function tryAssignment(assignments, usedSlots, subjectDayMap) {
    if (assignments.length === slotsNeeded) {
      currentSolution.push({
        subject: course.subject,
        courseType: course.courseType,
        remark: course.remark,
        slots: [...assignments]
      });
      backtrackSchedule(courseArrangements, consecutivePairs, existingSchedules, solutions, currentSolution, index + 1, maxSolutions);
      currentSolution.pop();
      return;
    }
    
    for (let i = 0; i < consecutivePairs.length; i++) {
      const pair = consecutivePairs[i];
      const key = `${pair.day_of_week}-${pair.start_slot}-${pair.end_slot}`;
      
      if (usedSlots.has(key)) continue;
      if (subjectDayMap.has(pair.day_of_week)) continue;
      
      usedSlots.add(key);
      subjectDayMap.set(pair.day_of_week, true);
      assignments.push(pair);
      
      tryAssignment(assignments, usedSlots, subjectDayMap);
      
      assignments.pop();
      subjectDayMap.delete(pair.day_of_week);
      usedSlots.delete(key);
      
      if (solutions.length >= maxSolutions) return;
    }
  }
  
  const usedSlots = new Set();
  for (let j = 0; j < index; j++) {
    for (const slot of currentSolution[j].slots) {
      usedSlots.add(`${slot.day_of_week}-${slot.start_slot}-${slot.end_slot}`);
    }
  }
  
  tryAssignment([], usedSlots, new Map());
}

function generateScheduleOptions(params) {
  const { studentId, weekStartDate, courseArrangements } = params;
  
  if (!courseArrangements || courseArrangements.length === 0) {
    return { success: false, message: '请先设置课时安排', options: [] };
  }
  
  const availableSlots = getStudentAvailableTimes(studentId);
  if (!availableSlots || availableSlots.length === 0) {
    return { success: false, message: '该学生未设置可排课时段', options: [] };
  }
  
  const teacherOffDays = getTeacherOffDays(weekStartDate);
  const existingSchedules = getExistingSchedules(studentId, weekStartDate);
  const consecutivePairs = identifyConsecutiveSlots(availableSlots, teacherOffDays);
  
  const totalHoursNeeded = courseArrangements.reduce((sum, c) => sum + c.hours, 0);
  const totalSlotsNeeded = totalHoursNeeded / 2;
  
  if (consecutivePairs.length < totalSlotsNeeded) {
    return { 
      success: false, 
      message: `可用连续时段不足。需要 ${totalSlotsNeeded} 个连续时段，但只有 ${consecutivePairs.length} 个可用`, 
      options: [] 
    };
  }
  
  const solutions = [];
  backtrackSchedule(courseArrangements, consecutivePairs, existingSchedules, solutions, [], 0, 15);
  
  if (solutions.length === 0) {
    return { success: false, message: '无法找到满足所有约束条件的排课方案', options: [] };
  }
  
  const options = solutions.map((solution, index) => {
    const scheduleItems = [];
    solution.forEach(item => {
      item.slots.forEach(slot => {
        scheduleItems.push({
          subject: item.subject,
          courseType: item.courseType,
          remark: item.remark,
          day_of_week: slot.day_of_week,
          start_slot: slot.start_slot,
          end_slot: slot.end_slot
        });
      });
    });
    
    return {
      id: index + 1,
      scheduleItems,
      summary: solution.map(s => ({
        subject: s.subject,
        courseType: s.courseType,
        hours: s.slots.length * 2,
        slots: s.slots
      }))
    };
  });
  
  return {
    success: true,
    options,
    message: `成功生成 ${options.length} 个排课方案`
  };
}

function applyScheduleOption(params) {
  const { studentId, weekStartDate, scheduleOption } = params;
  const db = getDatabase();
  
  try {
    const teacherMap = {};
    const teachers = getStudentTeacherMap(studentId);
    teachers.forEach(t => {
      teacherMap[t.subject] = t.teacher_id;
    });
    
    // 在删除前，检查新方案是否违反教室限制
    for (const item of scheduleOption.scheduleItems) {
      const limitCheck1 = checkClassroomLimit(weekStartDate, item.day_of_week, item.start_slot, item.courseType);
      const limitCheck2 = checkClassroomLimit(weekStartDate, item.day_of_week, item.end_slot, item.courseType);
      
      if (!limitCheck1.allowed && limitCheck1.isLimitReached) {
        return { 
          success: false, 
          message: `该方案冲突：周${item.day_of_week + 1}的时段${item.start_slot}已有5节线下课程，无法添加更多非网课课程` 
        };
      }
      
      if (!limitCheck2.allowed && limitCheck2.isLimitReached) {
        return { 
          success: false, 
          message: `该方案冲突：周${item.day_of_week + 1}的时段${item.end_slot}已有5节线下课程，无法添加更多非网课课程` 
        };
      }
    }
    
    db.prepare('DELETE FROM schedules WHERE student_id = ? AND week_start_date = ?')
      .run(studentId, weekStartDate);
    
    const insertStmt = db.prepare(`
      INSERT INTO schedules (student_id, teacher_id, subject, day_of_week, time_slot, week_start_date, course_type, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const item of scheduleOption.scheduleItems) {
      const teacherId = teacherMap[item.subject] || null;
      
      insertStmt.run(
        studentId,
        teacherId,
        item.subject,
        item.day_of_week,
        item.start_slot,
        weekStartDate,
        item.courseType,
        item.remark
      );
      
      insertStmt.run(
        studentId,
        teacherId,
        item.subject,
        item.day_of_week,
        item.end_slot,
        weekStartDate,
        item.courseType,
        item.remark
      );
    }
    
    return { success: true, message: '排课方案已成功应用' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  generateScheduleOptions,
  applyScheduleOption,
};
