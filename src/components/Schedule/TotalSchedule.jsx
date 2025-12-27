import { useEffect } from 'react';
import { Button } from 'antd';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScheduleStore } from '../../store/scheduleStore';
import ScheduleTable from './ScheduleTable';
import { getWeekDates, formatWeekRange } from '../../utils/dateUtils';
import { exportToPng } from '../../utils/exportToPng';
import dayjs from 'dayjs';
import { message } from 'antd';

function TotalSchedule() {
  const {
    currentWeekStart,
    schedules,
    setCurrentWeek,
    loadSchedules,
  } = useScheduleStore();

  const weekDates = getWeekDates(currentWeekStart);

  useEffect(() => {
    loadSchedules(currentWeekStart);
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
    const newWeek = dayjs(currentWeekStart).subtract(1, 'week').format('YYYY-MM-DD');
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = dayjs(currentWeekStart).add(1, 'week').format('YYYY-MM-DD');
    setCurrentWeek(newWeek);
  };

  const getCellContent = (dayOfWeek, timeSlot) => {
    const cellSchedules = schedules.filter(
      s => s.day_of_week === dayOfWeek && s.time_slot === timeSlot
    );
    return cellSchedules.map(s => {
      let content = `${s.student_name}-${s.subject}`;
      if (s.course_type) {
        content += s.course_type;
      }
      if (s.note) {
        content += `（${s.note}）`;
      }
      content += `(${s.teacher_name})`;
      return content;
    }).join('\n');
  };

  const calculateWeekHours = () => {
    return schedules.length;
  };

  const handleExport = async () => {
    await exportToPng('total', '总课表', currentWeekStart, schedules);
    message.success('课表导出成功');
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">一周总课表</h2>
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
          type="total"
          weekDates={weekDates}
          schedules={schedules}
          getCellContent={getCellContent}
          weekHours={calculateWeekHours()}
        />
      </div>
    </div>
  );
}

export default TotalSchedule;
