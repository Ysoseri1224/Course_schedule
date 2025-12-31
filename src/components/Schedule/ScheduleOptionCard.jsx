import React, { useState } from 'react';
import { Card, Button, Tag, Modal } from 'antd';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import './ScheduleOptionCard.css';

const DAYS_CN = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS = DAYS_CN;
const TIME_SLOTS = [
  '上午1', '上午2', '上午3', '上午4',
  '下午1', '下午2', '下午3', '下午4',
  '晚上1', '晚上2'
];

const SUBJECT_COLORS = {
  '阅读': '#1890ff',
  '听力': '#52c41a',
  '写作': '#fa8c16',
  '口语': '#eb2f96'
};

function ScheduleOptionCard({ option, onSelect, allOptions, currentIndex }) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [viewingIndex, setViewingIndex] = useState(currentIndex);
  
  const viewingOption = allOptions ? allOptions[viewingIndex] : option;
  const hasPrev = allOptions && viewingIndex > 0;
  const hasNext = allOptions && viewingIndex < allOptions.length - 1;
  
  const handlePrev = () => {
    if (hasPrev) {
      setViewingIndex(viewingIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (hasNext) {
      setViewingIndex(viewingIndex + 1);
    }
  };
  
  const handleOpenPreview = () => {
    setViewingIndex(currentIndex);
    setPreviewVisible(true);
  };
  const renderVisualPreview = () => {
    const scheduleMap = {};
    
    viewingOption.scheduleItems.forEach(item => {
      const key = `${item.day_of_week}-${item.time_slot}`;
      scheduleMap[key] = {
        subject: item.subject,
        courseType: item.courseType
      };
    });

    return (
      <div className="visual-schedule-preview">
        <table className="preview-schedule-table">
          <thead>
            <tr>
              <th className="preview-th-corner"></th>
              {DAYS.map((day, index) => (
                <th key={index} className="preview-th-day">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((slotId) => (
              <tr key={slotId}>
                <td className="preview-td-time">{TIME_SLOTS[slotId - 1]}</td>
                {DAYS.map((day, dayIndex) => {
                  const key = `${dayIndex + 1}-${slotId}`;
                  const schedule = scheduleMap[key];
                  return (
                    <td 
                      key={dayIndex} 
                      className="preview-td-cell"
                    >
                      {schedule && (
                        <div>
                          <div>{schedule.subject}</div>
                          <div style={{ fontSize: 11, color: '#666' }}>{schedule.courseType}</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="preview-lunch-break">
              <td colSpan="8" className="preview-lunch-cell">Lunch Break</td>
            </tr>
            {[5, 6, 7, 8, 9, 10].map((slotId) => {
              return (
                <tr key={slotId}>
                  <td className="preview-td-time">{TIME_SLOTS[slotId - 1]}</td>
                  {DAYS.map((day, dayIndex) => {
                    const key = `${dayIndex + 1}-${slotId}`;
                    const schedule = scheduleMap[key];
                    return (
                      <td 
                        key={dayIndex} 
                        className="preview-td-cell"
                      >
                        {schedule && (
                          <div>
                            <div>{schedule.subject}</div>
                            <div style={{ fontSize: 11, color: '#666' }}>{schedule.courseType}</div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const getSlotSuffix = (num) => {
    if (num === 1) return '1st';
    if (num === 2) return '2nd';
    if (num === 3) return '3rd';
    return `${num}th`;
  };

  const renderSummary = () => {
    if (!viewingOption.summary || viewingOption.summary.length === 0) {
      return null;
    }

    return (
      <div className="schedule-summary">
        {viewingOption.summary.map((item, index) => {
          const dayName = DAYS_EN[item.day] || `Day${item.day + 1}`;
          const slotNames = item.slots.map(s => getSlotSuffix(s)).join(' ');
          
          return (
            <div key={index} className="summary-item">
              <span className="summary-subject" style={{ color: SUBJECT_COLORS[item.subject] || '#666' }}>
                {item.subject}
              </span>
              <span className="summary-type">(对一)</span>
              <span className="summary-hours">: {item.hours}节课</span>
              <span className="slot-tag">
                {dayName} {slotNames}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Card 
        className="schedule-option-card"
        title={`方案 ${option.id}`}
        size="small"
      >
        {renderSummary()}
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Button 
            icon={<Eye size={16} />} 
            onClick={handleOpenPreview}
            style={{ flex: 1 }}
          >
            预览课表
          </Button>
          <Button 
            type="primary" 
            onClick={() => onSelect(option)}
            style={{ flex: 1 }}
          >
            选择方案
          </Button>
        </div>
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 40 }}>
            <span>方案 {viewingOption.id} - 课表预览</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button 
                icon={<ChevronLeft size={16} />}
                onClick={handlePrev}
                disabled={!hasPrev}
                size="small"
              >
                上一个
              </Button>
              <Button 
                icon={<ChevronRight size={16} />}
                onClick={handleNext}
                disabled={!hasNext}
                size="small"
              >
                下一个
              </Button>
            </div>
          </div>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button key="select" type="primary" onClick={() => {
            setPreviewVisible(false);
            onSelect(viewingOption);
          }}>
            选择此方案
          </Button>
        ]}
        width={1000}
      >
        {renderVisualPreview()}
      </Modal>
    </>
  );
}

export default ScheduleOptionCard;
