import React, { useState } from 'react';
import { Card, Button, Tag, Modal } from 'antd';
import { Eye } from 'lucide-react';
import './ScheduleOptionCard.css';

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
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

function ScheduleOptionCard({ option, onSelect }) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const renderVisualPreview = () => {
    const scheduleMap = {};
    
    option.scheduleItems.forEach(item => {
      const key1 = `${item.day_of_week}-${item.start_slot}`;
      const key2 = `${item.day_of_week}-${item.end_slot}`;
      scheduleMap[key1] = {
        subject: item.subject,
        courseType: item.courseType
      };
      scheduleMap[key2] = {
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
                  const key = `${dayIndex}-${slotId}`;
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
                    const key = `${dayIndex}-${slotId}`;
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

  const renderSummary = () => {
    if (!option.summary || option.summary.length === 0) {
      return null;
    }

    return (
      <div className="schedule-summary">
        {option.summary.map((item, index) => (
          <div key={index} className="summary-item">
            <span className="summary-subject" style={{ color: SUBJECT_COLORS[item.subject] }}>
              {item.subject}
            </span>
            <span className="summary-type">({item.courseType})</span>
            <span className="summary-hours">: {item.hours}节课</span>
            <div className="summary-slots">
              {item.slots.map((slot, slotIndex) => (
                <span key={slotIndex} className="slot-tag">
                  {DAYS[slot.day_of_week]} {TIME_SLOTS[slot.start_slot]}-{TIME_SLOTS[slot.end_slot]}
                </span>
              ))}
            </div>
          </div>
        ))}
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
            onClick={() => setPreviewVisible(true)}
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
        title={`方案 ${option.id} - 课表预览`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button key="select" type="primary" onClick={() => {
            setPreviewVisible(false);
            onSelect(option);
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
