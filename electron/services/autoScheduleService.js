const { getDatabase } = require('../database/connection');
const { checkClassroomLimit } = require('./scheduleService');

function getStudentAvailableTimes(studentId, weekStartDate) {
  const db = getDatabase();
  return db.prepare(`
    SELECT day_of_week, time_slot 
    FROM student_available_times 
    WHERE student_id = ? AND week_start_date = ?
  `).all(studentId, weekStartDate);
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

function identifyAvailableSlots(availableSlots, teacherOffDays) {
  const offDaySet = new Set(
    teacherOffDays.map(off => `${off.day_of_week}-${off.time_slot}`)
  );
  
  const availableSet = new Set(
    availableSlots.map(slot => `${slot.day_of_week}-${slot.time_slot}`)
  );
  
  const slots = [];
  
  for (let day = 0; day < 7; day++) {
    for (let timeSlot = 1; timeSlot <= 10; timeSlot++) {
      const key = `${day}-${timeSlot}`;
      
      if (availableSet.has(key) && !offDaySet.has(key)) {
        slots.push({
          day_of_week: day,
          time_slot: timeSlot
        });
      }
    }
  }
  
  return slots;
}

function groupConsecutiveSlots(availableSlots) {
  const slotsByDay = {};
  
  availableSlots.forEach(slot => {
    if (!slotsByDay[slot.day_of_week]) {
      slotsByDay[slot.day_of_week] = [];
    }
    slotsByDay[slot.day_of_week].push(slot.time_slot);
  });
  
  const consecutiveGroups = [];
  
  Object.keys(slotsByDay).forEach(day => {
    const dayNum = parseInt(day);
    const slots = slotsByDay[day].sort((a, b) => a - b);
    
    let group = [slots[0]];
    for (let i = 1; i < slots.length; i++) {
      if (slots[i] === slots[i-1] + 1) {
        group.push(slots[i]);
      } else {
        if (group.length >= 1) {
          consecutiveGroups.push({
            day_of_week: dayNum,
            slots: group
          });
        }
        group = [slots[i]];
      }
    }
    if (group.length >= 1) {
      consecutiveGroups.push({
        day_of_week: dayNum,
        slots: group
      });
    }
  });
  
  return consecutiveGroups;
}

function backtrackSchedule(courseArrangements, consecutiveGroups, availableSlotList, existingSchedules, solutions, currentSolution, index, constraints) {
  const maxSolutions = constraints?.maxSolutions || Infinity;
  if (solutions.length >= maxSolutions) return;
  
  if (index >= courseArrangements.length) {
    solutions.push([...currentSolution]);
    console.log(`✓ 找到方案 #${solutions.length}`);
    return;
  }
  
  const course = courseArrangements[index];
  const slotsNeeded = course.hours;
  
  if (index === 0) {
    console.log('\n=== 开始回溯搜索 ===');
    console.log('课程列表:', courseArrangements.map(c => `${c.subject}${c.hours}节`).join(', '));
  }
  console.log(`\n[深度${index}] 尝试分配: ${course.subject} ${course.hours}节`);
  
  function tryAssignment(selectedGroup, usedSlots) {
    if (selectedGroup && selectedGroup.slots.length === slotsNeeded) {
      currentSolution.push({
        subject: course.subject,
        courseType: course.courseType,
        remark: course.remark,
        day_of_week: selectedGroup.day_of_week,
        time_slots: selectedGroup.slots
      });
      backtrackSchedule(courseArrangements, consecutiveGroups, availableSlotList, existingSchedules, solutions, currentSolution, index + 1, constraints);
      currentSolution.pop();
      return;
    }
    
    for (let i = 0; i < consecutiveGroups.length; i++) {
      const group = consecutiveGroups[i];
      
      if (group.slots.length < slotsNeeded) continue;
      
      for (let start = 0; start <= group.slots.length - slotsNeeded; start++) {
        const selectedSlots = group.slots.slice(start, start + slotsNeeded);
        
        const allConsecutive = selectedSlots.every((slot, idx) => 
          idx === 0 || slot === selectedSlots[idx - 1] + 1
        );
        if (!allConsecutive) continue;
        
        const hasConflict = selectedSlots.some(slot => 
          usedSlots.has(`${group.day_of_week}-${slot}`)
        );
        if (hasConflict) {
          console.log(`  ✗ ${dayNames[group.day_of_week]}[${selectedSlots.join(',')}] 冲突`);
          continue;
        }
        
        if (constraints?.filters && constraints.filters.length > 0) {
          const violatesFilter = selectedSlots.some(slot => {
            const filter = constraints.filters.find(f => 
              f.day_of_week === group.day_of_week && f.time_slot === slot
            );
            return filter && filter.subject !== course.subject;
          });
          if (violatesFilter) {
            console.log(`  ✗ ${dayNames[group.day_of_week]}[${selectedSlots.join(',')}] 违反筛选`);
            continue;
          }
        }
        
        console.log(`  → 尝试 ${dayNames[group.day_of_week]}[${selectedSlots.join(',')}]`);
        
        const newUsedSlots = new Set(usedSlots);
        selectedSlots.forEach(slot => {
          newUsedSlots.add(`${group.day_of_week}-${slot}`);
        });
        
        tryAssignment({
          day_of_week: group.day_of_week,
          slots: selectedSlots
        }, newUsedSlots);
        
        if (solutions.length >= maxSolutions) return;
      }
    }
    
    if (slotsNeeded === 1) {
      for (let i = 0; i < availableSlotList.length; i++) {
        const slot = availableSlotList[i];
        const key = `${slot.day_of_week}-${slot.time_slot}`;
        
        if (usedSlots.has(key)) {
          console.log(`  ✗ ${dayNames[slot.day_of_week]}[${slot.time_slot}] 冲突`);
          continue;
        }
        
        if (constraints?.filters && constraints.filters.length > 0) {
          const filter = constraints.filters.find(f => 
            f.day_of_week === slot.day_of_week && f.time_slot === slot.time_slot
          );
          if (filter && filter.subject !== course.subject) {
            console.log(`  ✗ ${dayNames[slot.day_of_week]}[${slot.time_slot}] 违反筛选`);
            continue;
          }
        }
        
        console.log(`  → 尝试 ${dayNames[slot.day_of_week]}[${slot.time_slot}]`);
        
        const newUsedSlots = new Set(usedSlots);
        newUsedSlots.add(key);
        
        tryAssignment({
          day_of_week: slot.day_of_week,
          slots: [slot.time_slot]
        }, newUsedSlots);
        
        if (solutions.length >= maxSolutions) return;
      }
    }
  }
  
  const usedSlots = new Set();
  for (let j = 0; j < index; j++) {
    const item = currentSolution[j];
    item.time_slots.forEach(slot => {
      usedSlots.add(`${item.day_of_week}-${slot}`);
    });
  }
  
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (usedSlots.size > 0) {
    const usedList = Array.from(usedSlots).map(key => {
      const [day, slot] = key.split('-');
      return `${dayNames[day]}${slot}`;
    }).join(', ');
    console.log(`  已用时段: ${usedList}`);
  }
  
  tryAssignment(null, usedSlots);
}

function generateScheduleOptions(params) {
  const { studentId, weekStartDate, courseArrangements } = params;
  
  if (!courseArrangements || courseArrangements.length === 0) {
    return { success: false, message: '请先设置课时安排', options: [] };
  }
  
  const availableSlots = getStudentAvailableTimes(studentId, weekStartDate);
  if (!availableSlots || availableSlots.length === 0) {
    return { success: false, message: '该学生未设置该周段的可排课时段', options: [] };
  }
  
  const teacherOffDays = getTeacherOffDays(weekStartDate);
  const existingSchedules = getExistingSchedules(studentId, weekStartDate);
  const availableSlotList = identifyAvailableSlots(availableSlots, teacherOffDays);
  const consecutiveGroups = groupConsecutiveSlots(availableSlotList);
  
  const expandedArrangements = [];
  courseArrangements.forEach(course => {
    const fullClasses = Math.floor(course.hours / 2);
    const remainingHour = course.hours % 2;
    
    for (let i = 0; i < fullClasses; i++) {
      expandedArrangements.push({
        subject: course.subject,
        courseType: course.courseType,
        remark: course.remark,
        hours: 2,
        isFullClass: true
      });
    }
    
    if (remainingHour === 1) {
      expandedArrangements.push({
        subject: course.subject,
        courseType: course.courseType,
        remark: course.remark,
        hours: 1,
        isFullClass: false
      });
    }
  });
  
  const debugInfo = {
    original: courseArrangements.map(c => `${c.subject}${c.hours}课时`).join(', '),
    expanded: expandedArrangements.map(c => `${c.subject}${c.hours}课时`).join(', '),
    totalSlots: availableSlotList.length,
    groups: consecutiveGroups.map(g => {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return `${dayNames[g.day_of_week]}[${g.slots.join(',')}]`;
    }).join(', ')
  };
  
  const totalSlotsNeeded = expandedArrangements.reduce((sum, c) => sum + c.hours, 0);
  
  const totalAvailableSlots = availableSlotList.length;
  if (totalAvailableSlots < totalSlotsNeeded) {
    return { 
      success: false, 
      message: `可用时段不足。需要 ${totalSlotsNeeded} 个时段，但只有 ${totalAvailableSlots} 个可用`, 
      options: [] 
    };
  }
  
  const filters = params.filters || [];
  const constraints = {
    maxSolutions: params.maxSolutions || Infinity,
    filters: filters
  };
  
  const solutions = [];
  console.log('\n连续组详情:');
  consecutiveGroups.forEach(g => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    console.log(`  ${dayNames[g.day_of_week]}[${g.slots.join(',')}]`);
  });
  
  backtrackSchedule(expandedArrangements, consecutiveGroups, availableSlotList, existingSchedules, solutions, [], 0, constraints);
  
  console.log('\n=== 回溯结束 ===');
  console.log(`找到方案数: ${solutions.length}\n`);
  
  if (solutions.length === 0) {
    const detailedMessage = `无法找到排课方案\n\n【调试信息】\n` +
      `原始课时: ${debugInfo.original}\n` +
      `拆分后: ${debugInfo.expanded}\n` +
      `可用时段: ${debugInfo.totalSlots}个\n` +
      `连续组: ${debugInfo.groups}\n\n` +
      `可能原因: 需要${expandedArrangements.filter(c => c.hours === 2).length}个2连续时段对，请检查连续组是否足够`;
    return { success: false, message: detailedMessage, options: [] };
  }
  
  const options = solutions.map((solution, index) => {
    const scheduleItems = [];
    solution.forEach(item => {
      item.time_slots.forEach(timeSlot => {
        scheduleItems.push({
          subject: item.subject,
          courseType: item.courseType,
          remark: item.remark,
          day_of_week: item.day_of_week + 1,
          time_slot: timeSlot
        });
      });
    });
    
    return {
      id: index + 1,
      scheduleItems,
      summary: solution.map(s => ({
        subject: s.subject,
        courseType: s.courseType,
        hours: s.time_slots.length,
        day: s.day_of_week,
        slots: s.time_slots
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
      const limitCheck = checkClassroomLimit(weekStartDate, item.day_of_week, item.time_slot, item.courseType);
      
      if (!limitCheck.allowed && limitCheck.isLimitReached) {
        return { 
          success: false, 
          message: `该方案冲突：周${item.day_of_week + 1}的时段${item.time_slot}已有5节线下课程，无法添加更多非网课课程` 
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
        item.time_slot,
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
