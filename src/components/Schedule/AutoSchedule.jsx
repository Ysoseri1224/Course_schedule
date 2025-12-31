import React, { useState, useEffect } from 'react';
import { Select, Button, message, Card, Spin, Modal } from 'antd';
import { Wand2 } from 'lucide-react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CourseArrangementModal from './CourseArrangementModal';
import ScheduleOptionCard from './ScheduleOptionCard';
import FilterForm from './FilterForm';
import { useScheduleStore } from '../../store/scheduleStore';
import './AutoSchedule.css';

const { Option } = Select;

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const TIME_SLOTS = [
  { id: 1, label: '1st', period: '上午' },
  { id: 2, label: '2nd', period: '上午' },
  { id: 3, label: '3rd', period: '上午' },
  { id: 4, label: '4th', period: '上午' },
  { id: 5, label: '5th', period: '下午' },
  { id: 6, label: '6th', period: '下午' },
  { id: 7, label: '7th', period: '下午' },
  { id: 8, label: '8th', period: '下午' },
  { id: 9, label: '9th', period: '下午' },
  { id: 10, label: '10th', period: '下午' }
];

function AutoSchedule() {
  const { students, teachers, setActiveTab, setActiveStudent } = useScheduleStore();
  const [localStudents, setLocalStudents] = useState([]);
  const [localTeachers, setLocalTeachers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(dayjs().startOf('isoWeek'));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [teacherOffDays, setTeacherOffDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [courseArrangements, setCourseArrangements] = useState([]);
  const [showArrangementModal, setShowArrangementModal] = useState(false);
  const [filters, setFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    setLocalStudents(students);
    setLocalTeachers(teachers);
  }, [students, teachers]);

  useEffect(() => {
    if (selectedStudent && selectedWeek) {
      loadScheduleData();
    }
  }, [selectedStudent, selectedWeek]);

  const loadScheduleData = async () => {
    if (!selectedStudent) return;
    
    setLoading(true);
    try {
      const weekStart = selectedWeek.format('YYYY-MM-DD');
      const [slots, offDays] = await Promise.all([
        window.api.getStudentAvailableTimes(selectedStudent, weekStart),
        window.api.getTeacherOffDays(weekStart)
      ]);
      
      setAvailableSlots(slots || []);
      setTeacherOffDays(offDays || []);
    } catch (error) {
      message.error('加载排课数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getOffTeachers = (dayOfWeek, timeSlot) => {
    const offTeachersForSlot = teacherOffDays.filter(
      off => off.day_of_week === dayOfWeek && off.time_slot === timeSlot
    );
    
    return offTeachersForSlot.map(off => {
      const teacher = localTeachers.find(t => t.id === off.teacher_id);
      return teacher ? `${teacher.name}-休息` : '';
    }).filter(Boolean);
  };

  const getCellClass = (dayIndex, slotId) => {
    const hasSlot = availableSlots.some(
      s => s.day_of_week === dayIndex && s.time_slot === slotId
    );
    
    if (!hasSlot) return 'unavailable';
    
    const offTeachers = getOffTeachers(dayIndex, slotId);
    if (offTeachers.length > 0) return 'available has-off-teacher';
    
    return 'available';
  };

  const handlePrevWeek = () => {
    setSelectedWeek(selectedWeek.subtract(1, 'week').startOf('isoWeek'));
  };

  const handleNextWeek = () => {
    setSelectedWeek(selectedWeek.add(1, 'week').startOf('isoWeek'));
  };

  const getWeekRange = () => {
    const start = selectedWeek.startOf('isoWeek');
    const end = start.add(6, 'day');
    return `${start.format('YYYY-MM-DD')} 至 ${end.format('YYYY-MM-DD')}`;
  };

  const getWeekDates = () => {
    const start = selectedWeek.startOf('isoWeek');
    return Array.from({ length: 7 }, (_, i) => ({
      date: start.add(i, 'day').format('YYYY-MM-DD'),
      dayOfWeek: i,
      month: start.add(i, 'day').format('MM'),
      day: start.add(i, 'day').format('DD'),
      weekday: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
    }));
  };

  const handleOpenArrangementModal = () => {
    if (!selectedStudent) {
      message.warning('请先选择学生');
      return;
    }
    setShowArrangementModal(true);
  };

  const handleSaveCourseArrangements = (arrangements) => {
    setCourseArrangements(arrangements);
    message.success('课时安排已保存');
  };

  const handleGenerateSchedule = async () => {
    if (!selectedStudent) {
      message.warning('请先选择学生');
      return;
    }

    if (courseArrangements.length === 0) {
      message.warning('请先设置课时安排');
      return;
    }

    setGenerating(true);
    try {
      const result = await window.api.generateScheduleOptions({
        studentId: selectedStudent,
        weekStartDate: selectedWeek.format('YYYY-MM-DD'),
        courseArrangements: courseArrangements,
        filters: filters,
        maxSolutions: undefined
      });

      if (result.success) {
        setScheduleOptions(result.options || []);
        setCurrentPage(1);
        message.success(result.message || `生成排课方案成功，共${result.options?.length || 0}个方案`);
      } else {
        message.error(result.message || '生成方案失败');
      }
    } catch (error) {
      message.error('生成方案失败');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = async (option) => {
    Modal.confirm({
      title: '确认应用排课方案',
      content: `确认使用方案${option.id}？将覆盖该学生本周的现有排课`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await window.api.applyScheduleOption({
            studentId: selectedStudent,
            weekStartDate: selectedWeek.format('YYYY-MM-DD'),
            scheduleOption: option
          });

          if (result.success) {
            message.success(result.message || '排课成功！已同步到学生课表');
            setTimeout(() => {
              setActiveStudent(selectedStudent);
              setActiveTab('students');
            }, 1000);
          } else {
            message.error(result.message || '应用方案失败');
          }
        } catch (error) {
          message.error('应用方案失败');
          console.error(error);
        }
      }
    });
  };

  const selectedStudentData = localStudents.find(s => s.id === selectedStudent);

  const handleDeleteArrangement = (index) => {
    const newArrangements = courseArrangements.filter((_, i) => i !== index);
    setCourseArrangements(newArrangements);
    message.success('已删除');
  };

  const handleAddFilter = (filter) => {
    const exists = filters.find(f => 
      f.day_of_week === filter.day_of_week && f.time_slot === filter.time_slot
    );
    if (exists) {
      message.warning('该时段已设置筛选条件');
      return;
    }
    setFilters([...filters, filter]);
    message.success('筛选条件已添加');
  };

  const handleRemoveFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
    message.success('已移除筛选条件');
  };

  const getFilteredOptions = () => {
    return scheduleOptions;
  };

  const getPaginatedOptions = () => {
    const filtered = getFilteredOptions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(scheduleOptions.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getSubjectsFromArrangements = () => {
    return [...new Set(courseArrangements.map(c => c.subject))];
  };

  return (
    <div className="auto-schedule-container">
      <Card title={<span><Wand2 size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />自动排课</span>} className="auto-schedule-card">
        <div className="schedule-controls">
          <div className="control-group">
            <label>步骤1: 选择学生和周段</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Select
                style={{ width: 200 }}
                placeholder="选择学生"
                value={selectedStudent}
                onChange={(value) => {
                  setSelectedStudent(value);
                  setCourseArrangements([]);
                  setScheduleOptions([]);
                }}
              >
                {localStudents.map(s => (
                  <Option key={s.id} value={s.id}>{s.name}</Option>
                ))}
              </Select>

              <div className="week-selector">
                <Button icon={<ChevronLeft size={16} />} onClick={handlePrevWeek} />
                <span className="week-range">{getWeekRange()}</span>
                <Button icon={<ChevronRight size={16} />} onClick={handleNextWeek} />
              </div>
            </div>
          </div>
        </div>

        <div className="control-group">
          <label>步骤2: 查看学生可排课时段</label>
          <div className="legend">
            <span className="legend-item">
              <span className="legend-color available"></span>
              可排课
            </span>
            <span className="legend-item">
              <span className="legend-color unavailable"></span>
              不可排课
            </span>
            <span className="legend-item">
              <span className="legend-color has-off-teacher"></span>
              教师休息
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin tip="加载中..." />
          </div>
        ) : selectedStudent ? (
          <div className="schedule-table-wrapper">
            <table className="auto-schedule-table">
              <thead>
                <tr>
                  <th className="schedule-th-corner"></th>
                  {getWeekDates().map(date => (
                    <th key={date.dayOfWeek} className="schedule-th-day">
                      <div className="schedule-date">{date.month}.{date.day}</div>
                      <div className="schedule-weekday">{date.weekday}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.slice(0, 4).map(slot => (
                  <tr key={slot.id}>
                    <td className="schedule-td-time">
                      <div className="schedule-time-label">{slot.label}</div>
                    </td>
                    {getWeekDates().map(date => {
                      const cellClass = getCellClass(date.dayOfWeek, slot.id);
                      const offTeachers = getOffTeachers(date.dayOfWeek, slot.id);
                      return (
                        <td key={date.dayOfWeek} className={`schedule-td-cell ${cellClass}`}>
                          {offTeachers.length > 0 && (
                            <div className="off-teacher-hint">
                              {offTeachers.join(', ')}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="schedule-lunch-break">
                  <td colSpan="8" className="schedule-lunch-cell">Lunch Break</td>
                </tr>
                {TIME_SLOTS.slice(4).map(slot => (
                  <tr key={slot.id}>
                    <td className="schedule-td-time">
                      <div className="schedule-time-label">{slot.label}</div>
                    </td>
                    {getWeekDates().map(date => {
                      const cellClass = getCellClass(date.dayOfWeek, slot.id);
                      const offTeachers = getOffTeachers(date.dayOfWeek, slot.id);
                      return (
                        <td key={date.dayOfWeek} className={`schedule-td-cell ${cellClass}`}>
                          {offTeachers.length > 0 && (
                            <div className="off-teacher-hint">
                              {offTeachers.join(', ')}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            请先选择学生
          </div>
        )}

        <div className="control-group" style={{ marginTop: 24 }}>
          <label>步骤3: 设置课时安排</label>
          <Button
            onClick={handleOpenArrangementModal}
            disabled={!selectedStudent}
            style={{ marginBottom: 16 }}
          >
            添加课时安排
          </Button>
          
          {courseArrangements.length > 0 ? (
            <div className="course-arrangements-list">
              {courseArrangements.map((arr, index) => (
                <div key={index} className="arrangement-item">
                  <div className="arrangement-info">
                    <span className="arrangement-subject">{arr.subject}</span>
                    <span className="arrangement-type">{arr.courseType}</span>
                    <span className="arrangement-hours">{arr.hours}节</span>
                    {arr.remark && <span className="arrangement-remark">（{arr.remark}）</span>}
                  </div>
                  <Button 
                    size="small" 
                    danger 
                    onClick={() => handleDeleteArrangement(index)}
                  >
                    删除
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#999', fontSize: 14 }}>
              暂无课时安排
            </div>
          )}
        </div>

        <div className="control-group">
          <label>步骤4: 设置筛选条件（可选）</label>
          <div style={{ marginBottom: 16 }}>
            <Button onClick={() => setShowFilterModal(true)} disabled={courseArrangements.length === 0}>
              添加筛选条件
            </Button>
            <span style={{ marginLeft: 12, color: '#666', fontSize: 13 }}>可指定特定时段必须安排特定科目</span>
          </div>
          
          {filters.length > 0 && (
            <div className="filters-list" style={{ marginBottom: 16 }}>
              {filters.map((filter, index) => {
                const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const slotLabel = TIME_SLOTS.find(s => s.id === filter.time_slot)?.label || filter.time_slot;
                return (
                  <div key={index} className="filter-item" style={{ display: 'inline-flex', alignItems: 'center', marginRight: 8, marginBottom: 8, padding: '4px 12px', background: '#f0f0f0', borderRadius: 4 }}>
                    <span>{dayNames[filter.day_of_week]} {slotLabel}: {filter.subject}</span>
                    <Button type="link" size="small" danger onClick={() => handleRemoveFilter(index)} style={{ marginLeft: 8, padding: 0 }}>
                      ×
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="control-group">
          <label>步骤5: 生成排课方案</label>
          <Button
            type="primary"
            onClick={handleGenerateSchedule}
            loading={generating}
            disabled={!selectedStudent || availableSlots.length === 0 || courseArrangements.length === 0}
          >
            生成排课方案
          </Button>
        </div>

        {scheduleOptions.length > 0 && (
          <div className="schedule-options">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>可选排课方案（共 {scheduleOptions.length} 个）</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button 
                  icon={<ChevronLeft size={16} />} 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                />
                <span>第 {currentPage} / {totalPages} 页</span>
                <Button 
                  icon={<ChevronRight size={16} />} 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                />
              </div>
            </div>
            <div className="options-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {getPaginatedOptions().map((option, idx) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + idx;
                return (
                  <ScheduleOptionCard 
                    key={option.id} 
                    option={option}
                    onSelect={handleSelectOption}
                    allOptions={scheduleOptions}
                    currentIndex={globalIndex}
                  />
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <CourseArrangementModal
        visible={showArrangementModal}
        onClose={() => setShowArrangementModal(false)}
        onSave={handleSaveCourseArrangements}
        initialArrangements={courseArrangements}
        studentId={selectedStudent}
      />

      <Modal
        title="添加筛选条件"
        open={showFilterModal}
        onCancel={() => setShowFilterModal(false)}
        footer={null}
        width={600}
      >
        <FilterForm 
          subjects={getSubjectsFromArrangements()}
          onAdd={(filter) => {
            handleAddFilter(filter);
            setShowFilterModal(false);
          }}
        />
      </Modal>
    </div>
  );
}

export default AutoSchedule;
