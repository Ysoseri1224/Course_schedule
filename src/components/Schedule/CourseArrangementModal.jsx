import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, InputNumber, Input, Button, Table, Space, message } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const SUBJECTS = ['阅读', '听力', '写作', '口语'];
const COURSE_TYPES = ['一对一', '网课', '班课', '其他'];

function CourseArrangementModal({ visible, onClose, onSave, initialArrangements = [] }) {
  const [form] = Form.useForm();
  const [arrangements, setArrangements] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (visible) {
      setArrangements(initialArrangements.map((item, index) => ({ ...item, id: index + 1 })));
      setEditingId(null);
      form.resetFields();
    }
  }, [visible, initialArrangements]);

  const handleAdd = () => {
    form.validateFields().then(values => {
      if (editingId !== null) {
        setArrangements(prev => 
          prev.map(item => item.id === editingId ? { ...values, id: editingId } : item)
        );
        setEditingId(null);
        message.success('修改成功');
      } else {
        const newId = arrangements.length > 0 ? Math.max(...arrangements.map(a => a.id)) + 1 : 1;
        setArrangements(prev => [...prev, { ...values, id: newId }]);
        message.success('添加成功');
      }
      form.resetFields();
    }).catch(error => {
      console.error('验证失败:', error);
    });
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      subject: record.subject,
      courseType: record.courseType,
      hours: record.hours,
      remark: record.remark
    });
  };

  const handleDelete = (id) => {
    setArrangements(prev => prev.filter(item => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      form.resetFields();
    }
    message.success('删除成功');
  };

  const handleOk = () => {
    if (arrangements.length === 0) {
      message.warning('请至少添加一条课时安排');
      return;
    }
    onSave(arrangements.map(({ id, ...rest }) => rest));
    onClose();
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingId(null);
    onClose();
  };

  const columns = [
    {
      title: '课程',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: '课程类型',
      dataIndex: 'courseType',
      key: 'courseType',
    },
    {
      title: '本周课时数',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours) => `${hours}节`
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (text) => text || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="课时安排设置"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      width={800}
      okText="确定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          name="subject"
          label="课程"
          rules={[{ required: true, message: '请选择课程' }]}
        >
          <Select placeholder="选择课程">
            {SUBJECTS.map(subject => (
              <Option key={subject} value={subject}>{subject}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="courseType"
          label="课程类型"
          rules={[{ required: true, message: '请选择课程类型' }]}
        >
          <Select placeholder="选择类型">
            {COURSE_TYPES.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="hours"
          label="本周课时数"
          rules={[
            { required: true, message: '请输入课时数' }
          ]}
        >
          <InputNumber 
            min={1} 
            step={2} 
            style={{ width: '100%' }}
            placeholder="输入课时数"
          />
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input placeholder="可选" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" onClick={handleAdd} block>
            {editingId !== null ? '更新' : '添加'}
          </Button>
        </Form.Item>
      </Form>

      {arrangements.length > 0 && (
        <Table
          dataSource={arrangements}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      )}

      {arrangements.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          暂无课时安排，请添加至少一条记录
        </div>
      )}
    </Modal>
  );
}

export default CourseArrangementModal;
