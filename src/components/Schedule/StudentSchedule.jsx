import { useEffect, useState } from 'react';
import { Button, Select, Modal, message, Input } from 'antd';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScheduleStore } from '../../store/scheduleStore';
import ScheduleTable from './ScheduleTable';
import { getWeekDates, formatWeekRange } from '../../utils/dateUtils';
import { exportToPng } from '../../utils/exportToPng';
import dayjs from 'dayjs';

function StudentSchedule() {
  const {
    students,
    teachers,
    activeStudentId,
    currentWeekStart,
    schedules,
    setCurrentWeek,
    loadSchedules,
    addSchedule,
    deleteSchedule,
  } = useScheduleStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [scheduleNote, setScheduleNote] = useState('');
  const [courseType, setCourseType] = useState('');
  const [customCourseType, setCustomCourseType] = useState('');
  const [allSchedulesCount, setAllSchedulesCount] = useState(0);
  const [subjectTeachers, setSubjectTeachers] = useState([]);
  const [customTitle, setCustomTitle] = useState('');

  const activeStudent = students.find(s => s.id === activeStudentId);
  const weekDates = getWeekDates(currentWeekStart);

  useEffect(() => {
    if (activeStudentId) {
      loadSchedules(currentWeekStart);
      loadAllSchedulesCount();
    }
  }, [activeStudentId, currentWeekStart]);

  useEffect(() => {
    if (activeStudentId) {
      loadSubjectTeachers();
      // 切换学生时重置自定义标题
      setCustomTitle('');
    }
  }, [activeStudentId]);

  const loadAllSchedulesCount = async () => {
    if (!activeStudentId) return;
    try {
      const count = await window.api.getAllStudentSchedules(activeStudentId, currentWeekStart);
      setAllSchedulesCount(count);
    } catch (error) {
      console.error('加载课程总数失败:', error);
      setAllSchedulesCount(0);
    }
  };

  const loadSubjectTeachers = async () => {
    if (!activeStudentId) return;
    const data = await window.api.getStudentTeacherSubjects(activeStudentId);
    setSubjectTeachers(data);
  };

  const handlePrevWeek = () => {
    const newWeek = dayjs(currentWeekStart).subtract(1, 'week').format('YYYY-MM-DD');
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = dayjs(currentWeekStart).add(1, 'week').format('YYYY-MM-DD');
    setCurrentWeek(newWeek);
  };

  const handleCellClick = async (dayOfWeek, timeSlot) => {
    if (!isEditMode) return;

    const existingSchedule = schedules.find(
      s => s.student_id === activeStudentId && 
           s.day_of_week === dayOfWeek && 
           s.time_slot === timeSlot
    );

    if (existingSchedule) {
      await deleteSchedule(existingSchedule.id);
      await loadAllSchedulesCount();
      message.success('已删除课程');
    } else {
      setEditingCell({ dayOfWeek, timeSlot });
      setScheduleNote('');
      setCourseType('');
      setCustomCourseType('');
    }
  };

  const handleSubjectSelect = async (subject) => {
    if (!editingCell) return;
    setSelectedSubject(subject);
  };

  const handleConfirmSchedule = async () => {
    if (!editingCell || !selectedSubject) return;

    const teacherSubjects = await window.api.getStudentTeacherSubjects(activeStudentId);
    const teacherForSubject = teacherSubjects.find(ts => ts.subject === selectedSubject);

    if (!teacherForSubject) {
      message.warning('请先为该学生设置对应科目的老师');
      setEditingCell(null);
      setSelectedSubject(null);
      setScheduleNote('');
      setCourseType('');
      setCustomCourseType('');
      return;
    }

    const finalCourseType = courseType === '自定义' ? customCourseType.trim() : courseType;
    
    // 检查教室限制
    try {
      const limitCheck = await window.api.checkClassroomLimit(
        currentWeekStart,
        editingCell.dayOfWeek,
        editingCell.timeSlot,
        finalCourseType
      );

      if (!limitCheck.allowed && limitCheck.isLimitReached) {
        message.warning('没有足够教室！该时段已有5节线下课程，只能添加网课类型的课程。');
        return;
      }
    } catch (error) {
      console.error('检查教室限制失败:', error);
    }
    
    await addSchedule({
      studentId: activeStudentId,
      teacherId: teacherForSubject.teacher_id,
      subject: selectedSubject,
      dayOfWeek: editingCell.dayOfWeek,
      timeSlot: editingCell.timeSlot,
      note: scheduleNote.trim() || null,
      courseType: finalCourseType || null,
    });

    await loadAllSchedulesCount();
    setEditingCell(null);
    setSelectedSubject(null);
    setScheduleNote('');
    setCourseType('');
    setCustomCourseType('');
    message.success('添加课程成功');
  };

  const getCellContent = (dayOfWeek, timeSlot) => {
    const schedule = schedules.find(
      s => s.student_id === activeStudentId && 
           s.day_of_week === dayOfWeek && 
           s.time_slot === timeSlot
    );
    if (!schedule) return '';
    
    let content = schedule.subject;
    if (schedule.course_type) {
      content += schedule.course_type;
    }
    if (schedule.note) {
      content += `（${schedule.note}）`;
    }
    return content;
  };

  const calculateWeekHours = () => {
    return schedules.filter(s => s.student_id === activeStudentId).length;
  };

  const calculateRemainingHours = () => {
    if (!activeStudent) return 0;
    const totalHours = activeStudent.total_hours || 0;
    return totalHours - allSchedulesCount;
  };

  const handleExport = async () => {
    if (!activeStudent) return;
    const fileName = customTitle || `${activeStudent.name} 一对一雅思课程表`;
    await exportToPng(
      'student',
      fileName,
      currentWeekStart,
      schedules.filter(s => s.student_id === activeStudentId)
    );
    message.success('课表导出成功');
  };

  if (!activeStudent) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无学生</h3>
        <p className="text-sm text-gray-500">点击左侧的"+"按钮添加学生</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">
            {activeStudent.name} - 一对一雅思课程表
            {activeStudent.start_date && (
              <span className="text-sm font-normal text-gray-600 ml-4">
                开课时间：{activeStudent.start_date}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <Button icon={<ChevronLeft size={16} />} onClick={handlePrevWeek} />
            <span className="font-semibold">{formatWeekRange(currentWeekStart)}</span>
            <Button icon={<ChevronRight size={16} />} onClick={handleNextWeek} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type={isEditMode ? 'primary' : 'default'}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? '完成编辑' : '编辑课表'}
          </Button>
          <Button icon={<Download size={16} />} onClick={handleExport}>
            导出PNG
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <ScheduleTable
          type="student"
          studentName={activeStudent.name}
          weekDates={weekDates}
          schedules={schedules.filter(s => s.student_id === activeStudentId)}
          onCellClick={handleCellClick}
          isEditMode={isEditMode}
          getCellContent={getCellContent}
          totalHours={activeStudent.total_hours || 0}
          weekHours={calculateWeekHours()}
          remainingHours={calculateRemainingHours()}
          subjectTeachers={subjectTeachers}
          customTitle={customTitle}
          onTitleChange={setCustomTitle}
        />
      </div>

      <Modal
        title="添加课程"
        open={!!editingCell}
        onCancel={() => {
          setEditingCell(null);
          setSelectedSubject(null);
          setScheduleNote('');
          setCourseType('');
          setCustomCourseType('');
        }}
        onOk={handleConfirmSchedule}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ disabled: !selectedSubject }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">选择科目</label>
            <div className="grid grid-cols-2 gap-2">
              {['听力', '阅读', '口语', '写作'].map(subject => (
                <Button
                  key={subject}
                  type={selectedSubject === subject ? 'primary' : 'default'}
                  onClick={() => handleSubjectSelect(subject)}
                  className="h-12"
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">课程类型（可选）</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {['班课', '一对一', '网课', '自定义'].map(type => (
                <Button
                  key={type}
                  type={courseType === type ? 'primary' : 'default'}
                  onClick={() => setCourseType(type)}
                  size="small"
                >
                  {type}
                </Button>
              ))}
            </div>
            {courseType === '自定义' && (
              <Input
                value={customCourseType}
                onChange={(e) => setCustomCourseType(e.target.value)}
                placeholder="输入自定义课程类型"
                className="mb-2"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">备注（可选）</label>
            <Input.TextArea
              value={scheduleNote}
              onChange={(e) => setScheduleNote(e.target.value)}
              placeholder="输入课程备注信息"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default StudentSchedule;
