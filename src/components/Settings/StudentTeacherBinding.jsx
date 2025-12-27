import { useState, useEffect } from 'react';
import { Modal, Select, Button, message, Table } from 'antd';
import { useScheduleStore } from '../../store/scheduleStore';

function StudentTeacherBinding({ visible, onClose, studentId }) {
  const { students, teachers } = useScheduleStore();
  const [bindings, setBindings] = useState({
    听力: null,
    阅读: null,
    口语: null,
    写作: null,
  });

  const student = students.find(s => s.id === studentId);

  useEffect(() => {
    if (studentId && visible) {
      loadBindings();
    }
  }, [studentId, visible]);

  const loadBindings = async () => {
    const data = await window.api.getStudentTeacherSubjects(studentId);
    const bindingMap = {};
    data.forEach(item => {
      bindingMap[item.subject] = item.teacher_id;
    });
    setBindings({
      听力: bindingMap['听力'] || null,
      阅读: bindingMap['阅读'] || null,
      口语: bindingMap['口语'] || null,
      写作: bindingMap['写作'] || null,
    });
  };

  const handleSave = async () => {
    try {
      for (const [subject, teacherId] of Object.entries(bindings)) {
        if (teacherId) {
          await window.api.setStudentTeacherSubject(studentId, teacherId, subject);
        }
      }
      message.success('教师绑定保存成功');
      onClose();
    } catch (error) {
      message.error('保存失败');
      console.error(error);
    }
  };

  const columns = [
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      width: 100,
    },
    {
      title: '授课教师',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (_, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="选择教师"
          value={bindings[record.subject]}
          onChange={(value) => setBindings({ ...bindings, [record.subject]: value })}
          allowClear
        >
          {teachers.map(teacher => (
            <Select.Option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  const dataSource = [
    { key: '1', subject: '听力' },
    { key: '2', subject: '阅读' },
    { key: '3', subject: '口语' },
    { key: '4', subject: '写作' },
  ];

  return (
    <Modal
      title={`设置教师 - ${student?.name}`}
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      width={600}
      okText="保存"
      cancelText="取消"
    >
      <div className="mb-4 text-sm text-gray-600">
        为该学生的各科目指定授课教师
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
      />
    </Modal>
  );
}

export default StudentTeacherBinding;
