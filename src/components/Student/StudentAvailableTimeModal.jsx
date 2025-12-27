import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import './StudentAvailableTimeModal.css';

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

function StudentAvailableTimeModal({ visible, open, onClose, student }) {
  const [selectedTimes, setSelectedTimes] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const isOpen = visible !== undefined ? visible : open;

  useEffect(() => {
    if (isOpen && student) {
      loadAvailableTimes();
    }
  }, [isOpen, student]);

  const loadAvailableTimes = async () => {
    if (!student) return;
    
    try {
      const times = await window.api.getStudentAvailableTimes(student.id);
      const timeSet = new Set();
      times.forEach(t => {
        timeSet.add(`${t.day_of_week}-${t.time_slot}`);
      });
      setSelectedTimes(timeSet);
    } catch (error) {
      message.error('加载可排课时段失败');
      console.error(error);
    }
  };

  const toggleTimeSlot = (dayIndex, slotId) => {
    const key = `${dayIndex}-${slotId}`;
    const newSet = new Set(selectedTimes);
    
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    
    setSelectedTimes(newSet);
  };

  const handleMouseDown = (dayIndex, slotId) => {
    const key = `${dayIndex}-${slotId}`;
    const isSelected = selectedTimes.has(key);
    setIsDragging(true);
    setDragMode(!isSelected);
    toggleTimeSlot(dayIndex, slotId);
  };

  const handleMouseEnter = (dayIndex, slotId) => {
    if (!isDragging) return;
    const key = `${dayIndex}-${slotId}`;
    const isSelected = selectedTimes.has(key);
    
    if (dragMode && !isSelected) {
      const newSet = new Set(selectedTimes);
      newSet.add(key);
      setSelectedTimes(newSet);
    } else if (!dragMode && isSelected) {
      const newSet = new Set(selectedTimes);
      newSet.delete(key);
      setSelectedTimes(newSet);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };

  const handleSave = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      const timesArray = Array.from(selectedTimes).map(key => {
        const [day, slot] = key.split('-');
        return {
          day_of_week: parseInt(day),
          time_slot: parseInt(slot)
        };
      });
      
      await window.api.setStudentAvailableTimes(student.id, timesArray);
      message.success('保存成功');
      onClose();
    } catch (error) {
      message.error('保存失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`设置可排课时段 - ${student?.name || ''}`}
      open={isOpen}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={loading}
      width={800}
      okText="保存"
      cancelText="取消"
      onMouseUp={handleMouseUp}
    >
      <div className="available-time-grid">
        <div className="time-header">
          <div className="corner-cell"></div>
          {DAYS.map((day, index) => (
            <div key={index} className="day-header">{day}</div>
          ))}
        </div>
        
        {['上午', '下午'].map(period => (
          <React.Fragment key={period}>
            <div className="period-label-row">
              <div className="period-label">{period}</div>
              <div className="period-divider"></div>
            </div>
            {TIME_SLOTS.filter(slot => slot.period === period).map(slot => (
              <div key={slot.id} className="time-row">
                <div className="slot-label">{slot.label}</div>
                {DAYS.map((day, dayIndex) => {
                  const key = `${dayIndex}-${slot.id}`;
                  const isSelected = selectedTimes.has(key);
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`time-cell ${isSelected ? 'selected' : ''}`}
                      onMouseDown={() => handleMouseDown(dayIndex, slot.id)}
                      onMouseEnter={() => handleMouseEnter(dayIndex, slot.id)}
                      onMouseUp={handleMouseUp}
                    >
                      {isSelected && '✓'}
                    </div>
                  );
                })}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      <div className="available-time-hint">
        点击单元格选择/取消可排课时段
      </div>
    </Modal>
  );
}

export default StudentAvailableTimeModal;
