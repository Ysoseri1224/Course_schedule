import React, { useState } from 'react';
import { Select, Button, Form } from 'antd';

const { Option } = Select;

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' }
];

const TIME_SLOTS = [
  { id: 1, label: '1st' },
  { id: 2, label: '2nd' },
  { id: 3, label: '3rd' },
  { id: 4, label: '4th' },
  { id: 5, label: '5th' },
  { id: 6, label: '6th' },
  { id: 7, label: '7th' },
  { id: 8, label: '8th' },
  { id: 9, label: '9th' },
  { id: 10, label: '10th' }
];

function FilterForm({ subjects, onAdd }) {
  const [dayOfWeek, setDayOfWeek] = useState(null);
  const [timeSlot, setTimeSlot] = useState(null);
  const [subject, setSubject] = useState(null);

  const handleSubmit = () => {
    if (dayOfWeek === null || timeSlot === null || !subject) {
      return;
    }
    onAdd({
      day_of_week: dayOfWeek,
      time_slot: timeSlot,
      subject: subject
    });
    setDayOfWeek(null);
    setTimeSlot(null);
    setSubject(null);
  };

  return (
    <Form layout="vertical">
      <Form.Item label="选择星期" required>
        <Select
          value={dayOfWeek}
          onChange={setDayOfWeek}
          placeholder="选择星期"
        >
          {DAYS.map(day => (
            <Option key={day.value} value={day.value}>{day.label}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="选择时段" required>
        <Select
          value={timeSlot}
          onChange={setTimeSlot}
          placeholder="选择时段"
        >
          {TIME_SLOTS.map(slot => (
            <Option key={slot.id} value={slot.id}>{slot.label}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="选择科目" required>
        <Select
          value={subject}
          onChange={setSubject}
          placeholder="选择科目"
        >
          {subjects.map(subj => (
            <Option key={subj} value={subj}>{subj}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          onClick={handleSubmit}
          disabled={dayOfWeek === null || timeSlot === null || !subject}
        >
          添加筛选条件
        </Button>
      </Form.Item>
    </Form>
  );
}

export default FilterForm;
