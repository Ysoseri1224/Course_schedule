import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScheduleStore } from '../../store/scheduleStore';
import ScheduleTable from './ScheduleTable';
import { getWeekDates, formatWeekRange } from '../../utils/dateUtils';
import { exportToPng } from '../../utils/exportToPng';
import dayjs from 'dayjs';
import { message } from 'antd';

function TeacherSchedule() {
  const {
    teachers,
    activeTeacherId,
    currentWeekStart,
    schedules,
    setCurrentWeek,
    loadSchedules,
  } = useScheduleStore();
  
  const [teacherOffDays, setTeacherOffDays] = useState([]);
  const [customTitle, setCustomTitle] = useState('');

  const activeTeacher = teachers.find(t => t.id === activeTeacherId);
  const weekDates = getWeekDates(currentWeekStart);

  useEffect(() => {
    if (activeTeacherId) {
      loadSchedules(currentWeekStart);
      loadTeacherOffDays();
      // 切换教师时重置自定义标题
      setCustomTitle('');
    }
  }, [activeTeacherId, currentWeekStart]);
  
  const loadTeacherOffDays = async () => {
    try {
      const offDays = await window.api.getTeacherOffDays(currentWeekStart);
      setTeacherOffDays(offDays);
    } catch (error) {
      console.error('加载教师休息日失败:', error);
    }
  };
  
  const isOffDay = (dayOfWeek, timeSlot) => {
    return teacherOffDays.some(
      offDay => offDay.teacher_id === activeTeacherId && 
               offDay.day_of_week === dayOfWeek && 
               offDay.time_slot === timeSlot
    );
  };

  const handleCellDoubleClick = async (dayOfWeek, timeSlot) => {
    if (!activeTeacherId) return;
    try {
      await window.api.toggleTeacherOffDay(activeTeacherId, currentWeekStart, dayOfWeek, timeSlot);
      loadTeacherOffDays();
      message.success('休息日设置已更新');
    } catch (error) {
      console.error('设置休息日失败:', error);
      message.error('设置休息日失败');
    }
  };

  const handleBatchOffDay = async (dayOfWeek, period) => {
    if (!activeTeacherId) return;
    try {
      await window.api.setBatchOffDay(activeTeacherId, currentWeekStart, dayOfWeek, period);
      loadTeacherOffDays();
      const periodLabels = { none: '取消', morning: '上午', afternoon: '下午', evening: '晚上', allday: '全天' };
      message.success(period === 'none' ? '已取消休息' : `已设置${periodLabels[period]}休息`);
    } catch (error) {
      console.error('批量设置休息日失败:', error);
      message.error('设置失败');
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

  const getCellContent = (dayOfWeek, timeSlot) => {
    const matchingSchedules = schedules.filter(
      s => s.teacher_id === activeTeacherId && 
           s.day_of_week === dayOfWeek && 
           s.time_slot === timeSlot
    );
    
    if (matchingSchedules.length === 0) return '';
    
    return matchingSchedules.map(schedule => {
      let content = `${schedule.student_name}-${schedule.subject}`;
      if (schedule.course_type) {
        content += schedule.course_type;
      }
      if (schedule.note) {
        content += `（${schedule.note}）`;
      }
      return content;
    }).join('\n');
  };

  const calculateWeekHours = () => {
    return schedules.filter(s => s.teacher_id === activeTeacherId).length;
  };

  const handleExport = async () => {
    if (!activeTeacher) return;
    const fileName = customTitle || `${activeTeacher.name} 一对一排班表`;
    await exportToPng(
      'teacher',
      fileName,
      currentWeekStart,
      schedules.filter(s => s.teacher_id === activeTeacherId)
    );
    message.success('课表导出成功');
  };

  if (!activeTeacher) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-6xl mb-4">👨‍🏫</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无教师</h3>
        <p className="text-sm text-gray-500">点击左侧的"+"按钮添加教师</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">{activeTeacher.name} - 一对一排班表</h2>
          <div className="flex items-center gap-2">
            <Button icon={<ChevronLeft size={16} />} onClick={handlePrevWeek} />
            <span className="font-semibold">{formatWeekRange(currentWeekStart)}</span>
            <Button icon={<ChevronRight size={16} />} onClick={handleNextWeek} />
          </div>
        </div>
        <Button icon={<Download size={16} />} onClick={handleExport}>
          导出PNG
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <ScheduleTable
          type="teacher"
          teacherName={activeTeacher.name}
          customTitle={customTitle}
          onTitleChange={setCustomTitle}
          weekDates={weekDates}
          schedules={schedules.filter(s => s.teacher_id === activeTeacherId)}
          getCellContent={getCellContent}
          weekHours={calculateWeekHours()}
          isOffDay={isOffDay}
          onCellDoubleClick={handleCellDoubleClick}
          onBatchOffDay={handleBatchOffDay}
        />
      </div>
    </div>
  );
}

export default TeacherSchedule;
