import { useState } from 'react';
import { Dropdown } from 'antd';
import { TIME_SLOTS } from '../../utils/dateUtils';
import logoImg from '/logo.png';
import './ScheduleTable.css';

const OFF_DAY_OPTIONS = [
  { key: 'none', label: '取消休息' },
  { key: 'morning', label: '上午休息' },
  { key: 'afternoon', label: '下午休息' },
  { key: 'evening', label: '晚上休息' },
  { key: 'allday', label: '全天休息' },
];

function ScheduleTable({ 
  type, 
  studentName, 
  teacherName,
  weekDates, 
  schedules, 
  onCellClick, 
  isEditMode,
  getCellContent,
  totalHours = 0,
  weekHours = 0,
  remainingHours = 0,
  subjectTeachers = [],
  isOffDay,
  onCellDoubleClick,
  onBatchOffDay,
  customTitle,
  onTitleChange
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');

  const handleBatchOffDay = (dayOfWeek, period) => {
    if (onBatchOffDay) {
      onBatchOffDay(dayOfWeek, period);
    }
  };

  const getTitle = () => {
    if (type === 'student') {
      return `${studentName} 一对一雅思课程表`;
    } else if (type === 'teacher') {
      return `${teacherName} 一对一排班表`;
    } else {
      return '一周总课表';
    }
  };

  const getWeekRange = () => {
    if (weekDates.length === 0) return '';
    const start = weekDates[0];
    const end = weekDates[6];
    return `(${start.month}.${start.day}-${end.month}.${end.day})`;
  };

  const getDisplayTitle = () => {
    return customTitle || getTitle();
  };

  const handleTitleDoubleClick = () => {
    setEditableTitle(getDisplayTitle());
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (onTitleChange && editableTitle.trim()) {
      onTitleChange(editableTitle.trim());
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="schedule-table-container" id="schedule-export-area">
      <div className="schedule-header">
        <img 
          src={logoImg} 
          alt="创锦国际教育" 
          className="schedule-logo"
        />
        <div className="schedule-title-wrapper">
          {isEditingTitle ? (
            <input
              type="text"
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="schedule-title-input"
            />
          ) : (
            <h1 
              className="schedule-title" 
              onDoubleClick={handleTitleDoubleClick}
              title="双击编辑标题"
            >
              {getDisplayTitle()} {getWeekRange()}
            </h1>
          )}
        </div>
      </div>

      <div className="schedule-year">
        Academic Year — {weekDates.length > 0 ? weekDates[0].date.split('-')[0] : new Date().getFullYear()}
      </div>

      <table className="schedule-table">
        <thead>
          <tr>
            <th className="schedule-th-corner"></th>
            {weekDates.map(date => (
              <th key={date.dayOfWeek} className="schedule-th-day">
                <div className="schedule-date">{date.month}.{date.day}</div>
                {type === 'teacher' && onBatchOffDay ? (
                  <Dropdown
                    menu={{
                      items: OFF_DAY_OPTIONS,
                      onClick: ({ key }) => handleBatchOffDay(date.dayOfWeek, key),
                    }}
                    trigger={['click']}
                  >
                    <div className="schedule-weekday clickable" title="点击设置休息时段">
                      {date.weekday}
                    </div>
                  </Dropdown>
                ) : (
                  <div className="schedule-weekday">{date.weekday}</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.slice(0, 4).map(slot => (
            <tr key={slot.id}>
              <td className="schedule-td-time">
                <div className="schedule-time-label">{slot.label}</div>
                <div className="schedule-time-range">{slot.time}</div>
              </td>
              {weekDates.map(date => (
                <td
                  key={`${date.dayOfWeek}-${slot.id}`}
                  className={`schedule-td-cell ${isEditMode ? 'editable' : ''} ${isOffDay && isOffDay(date.dayOfWeek, slot.id) ? 'off-day' : ''}`}
                  onClick={() => onCellClick && onCellClick(date.dayOfWeek, slot.id)}
                  onDoubleClick={() => onCellDoubleClick && onCellDoubleClick(date.dayOfWeek, slot.id)}
                >
                  {getCellContent(date.dayOfWeek, slot.id)}
                </td>
              ))}
            </tr>
          ))}
          <tr className="schedule-lunch-break">
            <td colSpan="8" className="schedule-lunch-cell">
              Lunch Break
            </td>
          </tr>
          {TIME_SLOTS.slice(4).map(slot => (
            <tr key={slot.id}>
              <td className="schedule-td-time">
                <div className="schedule-time-label">{slot.label}</div>
                <div className="schedule-time-range">{slot.time}</div>
              </td>
              {weekDates.map(date => (
                <td
                  key={`${date.dayOfWeek}-${slot.id}`}
                  className={`schedule-td-cell ${isEditMode ? 'editable' : ''} ${isOffDay && isOffDay(date.dayOfWeek, slot.id) ? 'off-day' : ''}`}
                  onClick={() => onCellClick && onCellClick(date.dayOfWeek, slot.id)}
                  onDoubleClick={() => onCellDoubleClick && onCellDoubleClick(date.dayOfWeek, slot.id)}
                >
                  {getCellContent(date.dayOfWeek, slot.id)}
                </td>
              ))}
            </tr>
          ))}
          <tr className="schedule-summary-row">
            <td colSpan="8" className="schedule-summary-cell">
              {type === 'student' ? (
                <>共：<span className="font-semibold">{totalHours || 0}</span>节，本周：<span className="font-semibold">{weekHours || 0}</span>节，余：<span className="font-semibold">{remainingHours || 0}</span>节</>
              ) : (
                <>共：{weekHours || 0} 节</>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {type === 'student' && subjectTeachers.length > 0 && (
        <div className="schedule-subject-teachers-bottom">
          {subjectTeachers.map((st, index) => (
            <span key={index}>
              {st.subject}-{st.teacher_name}
              {index < subjectTeachers.length - 1 && ' '}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScheduleTable;
