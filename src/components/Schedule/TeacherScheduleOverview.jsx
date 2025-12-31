import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useScheduleStore } from '../../store/scheduleStore';
import { getWeekDates, formatWeekRange, TIME_SLOTS } from '../../utils/dateUtils';
import { exportToPng } from '../../utils/exportToPng';
import dayjs from 'dayjs';
import './TeacherScheduleOverview.css';

function TeacherScheduleOverview() {
  const {
    teachers,
    currentWeekStart,
    schedules,
    setCurrentWeek,
    loadSchedules,
  } = useScheduleStore();

  const [offDays, setOffDays] = useState({});
  const weekDates = getWeekDates(currentWeekStart);

  useEffect(() => {
    loadSchedules(currentWeekStart);
    loadOffDays();
  }, [currentWeekStart]);

  const loadOffDays = async () => {
    const data = await window.api.getTeacherOffDays(currentWeekStart);
    const offDaysMap = {};
    data.forEach(item => {
      const key = `${item.teacher_id}-${item.day_of_week}-${item.time_slot}`;
      offDaysMap[key] = true;
    });
    setOffDays(offDaysMap);
  };

  const isOffDaySlot = (teacherId, dayOfWeek, timeSlot) => {
    const key = `${teacherId}-${dayOfWeek}-${timeSlot}`;
    return offDays[key] || false;
  };

  // 分析休息时段，返回标准时段和额外时段
  const analyzeOffPeriods = (teacherId, dayOfWeek) => {
    const slots = [];
    for (let i = 1; i <= 10; i++) {
      if (isOffDaySlot(teacherId, dayOfWeek, i)) {
        slots.push(i);
      }
    }
    if (slots.length === 0) return { periods: [], extraSlots: [] };
    
    const result = { periods: [], extraSlots: [] };
    const slotSet = new Set(slots);
    
    // 检查全天（必须先检查，避免被拆分）
    if (slots.length === 10 && slots.join(',') === '1,2,3,4,5,6,7,8,9,10') {
      result.periods.push('allday');
      return result;
    }
    
    // 检查标准时段并标记
    const morning = [1, 2, 3, 4];
    const afternoon = [5, 6, 7, 8];
    const evening = [9, 10];
    
    if (morning.every(s => slotSet.has(s))) {
      result.periods.push('morning');
      morning.forEach(s => slotSet.delete(s));
    }
    
    if (afternoon.every(s => slotSet.has(s))) {
      result.periods.push('afternoon');
      afternoon.forEach(s => slotSet.delete(s));
    }
    
    if (evening.every(s => slotSet.has(s))) {
      result.periods.push('evening');
      evening.forEach(s => slotSet.delete(s));
    }
    
    // 剩余的是额外的单独时段
    result.extraSlots = Array.from(slotSet).sort((a, b) => a - b);
    
    return result;
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'morning': return '上午休息';
      case 'afternoon': return '下午休息';
      case 'evening': return '晚上休息';
      case 'allday': return '全天休息';
      default: return null;
    }
  };

  const handlePrevWeek = () => {
    const newWeek = dayjs(currentWeekStart).subtract(1, 'week').format('YYYY-MM-DD');
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = dayjs(currentWeekStart).add(1, 'week').format('YYYY-MM-DD');
    setCurrentWeek(newWeek);
  };


  const getCellSchedules = (teacherId, dayOfWeek, timeSlot) => {
    return schedules.filter(
      s => s.teacher_id === teacherId && 
           s.day_of_week === dayOfWeek && 
           s.time_slot === timeSlot
    );
  };

  const handleExport = async () => {
    await exportToPng('teacher-overview', '教师总排班表', currentWeekStart, schedules);
    message.success('课表导出成功');
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold">{formatWeekRange(currentWeekStart)}</span>
          <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight size={20} />
          </button>
        </div>
        <Button icon={<Download size={16} />} onClick={handleExport}>
          导出课表
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="teacher-overview-table">
          <thead>
            <tr>
              <th className="teacher-overview-corner">教师/时间</th>
              {weekDates.map(date => (
                <th key={date.dayOfWeek} className="teacher-overview-day">
                  <div>{date.month}.{date.day}</div>
                  <div>{date.weekday}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.id}>
                <td className="teacher-overview-name">{teacher.name}</td>
                {weekDates.map(date => {
                  const { periods, extraSlots } = analyzeOffPeriods(teacher.id, date.dayOfWeek);
                  
                  return (
                    <td
                      key={date.dayOfWeek}
                      className="teacher-overview-cell"
                    >
                      {/* 显示标准时段休息 */}
                      {periods.map(period => (
                        <div key={period} className="off-day-item period-off">
                          <span className="off-label">{getPeriodLabel(period)}</span>
                        </div>
                      ))}
                      
                      {/* 显示额外的单独休息时段 */}
                      {extraSlots.map(slotId => {
                        const slot = TIME_SLOTS.find(s => s.id === slotId);
                        if (!slot) return null;
                        return (
                          <div key={slotId} className="off-day-item">
                            <span className="time-label">{slot.label}</span>
                            <span className="off-label">休息</span>
                          </div>
                        );
                      })}
                      
                      {/* 显示排课 */}
                      {TIME_SLOTS.map(slot => {
                        const isOff = isOffDaySlot(teacher.id, date.dayOfWeek, slot.id);
                        if (isOff) return null; // 休息时段已经在上面显示了
                        
                        const cellSchedules = getCellSchedules(teacher.id, date.dayOfWeek, slot.id);
                        if (cellSchedules.length === 0) return null;
                        
                        return (
                          <div key={slot.id} className="schedule-item">
                            <span className="time-label">{slot.label}</span>
                            {cellSchedules.map((schedule, idx) => (
                              <span key={idx} className="student-name">
                                {schedule.student_name}
                                {schedule.course_type && `-${schedule.course_type}`}
                              </span>
                            ))}
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeacherScheduleOverview;
