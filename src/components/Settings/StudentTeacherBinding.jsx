import { useState, useEffect } from 'react';
import { Modal, Select, Button, message, Table, Input, Space } from 'antd';
import { useScheduleStore } from '../../store/scheduleStore';

function StudentTeacherBinding({ visible, onClose, studentId }) {
  const { students, teachers } = useScheduleStore();
  const [bindings, setBindings] = useState({
    听力: null,
    阅读: null,
    口语: null,
    写作: null,
  });
  const [customSubjects, setCustomSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');

  const student = students.find(s => s.id === studentId);

  useEffect(() => {
    if (studentId && visible) {
      loadBindings();
    }
  }, [studentId, visible]);

  const loadBindings = async () => {
    const data = await window.api.getStudentTeacherSubjects(studentId);
    const bindingMap = {};
    const standardSubjects = ['听力', '阅读', '口语', '写作'];
    const customSubjectList = [];
    
    data.forEach(item => {
      bindingMap[item.subject] = item.teacher_id;
      if (!standardSubjects.includes(item.subject)) {
        customSubjectList.push(item.subject);
      }
    });
    
    setBindings({
      听力: bindingMap['听力'] || null,
      阅读: bindingMap['阅读'] || null,
      口语: bindingMap['口语'] || null,
      写作: bindingMap['写作'] || null,
      ...customSubjectList.reduce((acc, subject) => {
        acc[subject] = bindingMap[subject] || null;
        return acc;
      }, {})
    });
    setCustomSubjects(customSubjectList);
  };

  const handleAddCustomSubject = () => {
    if (!newSubjectName.trim()) {
      message.warning('请输入科目名称');
      return;
    }
    const allSubjects = ['听力', '阅读', '口语', '写作', ...customSubjects];
    if (allSubjects.includes(newSubjectName.trim())) {
      message.warning('该科目已存在');
      return;
    }
    setCustomSubjects([...customSubjects, newSubjectName.trim()]);
    setBindings({ ...bindings, [newSubjectName.trim()]: null });
    setNewSubjectName('');
    message.success('科目添加成功');
  };

  const handleRemoveCustomSubject = async (subject) => {
    try {
      await window.api.deleteStudentTeacherSubject(studentId, subject);
      setCustomSubjects(customSubjects.filter(s => s !== subject));
      const newBindings = { ...bindings };
      delete newBindings[subject];
      setBindings(newBindings);
      message.success('科目删除成功');
    } catch (error) {
      message.error('删除科目失败');
      console.error(error);
    }
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
      width: 120,
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
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        record.isCustom ? (
          <Button 
            size="small" 
            danger 
            onClick={() => handleRemoveCustomSubject(record.subject)}
          >
            删除
          </Button>
        ) : null
      ),
    },
  ];

  const dataSource = [
    { key: '1', subject: '听力', isCustom: false },
    { key: '2', subject: '阅读', isCustom: false },
    { key: '3', subject: '口语', isCustom: false },
    { key: '4', subject: '写作', isCustom: false },
    ...customSubjects.map((subject, index) => ({
      key: `custom-${index}`,
      subject: subject,
      isCustom: true
    }))
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
      
      <div style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="输入自定义科目名称"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            onPressEnter={handleAddCustomSubject}
          />
          <Button type="primary" onClick={handleAddCustomSubject}>
            添加科目
          </Button>
        </Space.Compact>
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
