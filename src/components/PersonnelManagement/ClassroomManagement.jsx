import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const STATUS_COLORS = {
  'available': 'green',
  'unavailable': 'red',
  'self-study': 'blue'
};

const STATUS_LABELS = {
  'available': '可用',
  'unavailable': '不可用',
  'self-study': '自习室'
};

function ClassroomManagement() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    setLoading(true);
    try {
      const data = await window.api.getClassrooms();
      setClassrooms(data);
    } catch (error) {
      message.error('加载教室信息失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClassroom(null);
    form.resetFields();
    form.setFieldsValue({ status: 'available' });
    setModalVisible(true);
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    form.setFieldsValue({
      room_number: classroom.room_number,
      status: classroom.status
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await window.api.deleteClassroom(id);
      message.success('删除成功');
      loadClassrooms();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingClassroom) {
        await window.api.updateClassroom(editingClassroom.id, values.room_number, values.status);
        message.success('更新成功');
      } else {
        await window.api.addClassroom(values.room_number, values.status);
        message.success('添加成功');
      }
      
      setModalVisible(false);
      loadClassrooms();
    } catch (error) {
      if (error.errorFields) {
        message.warning('请填写必填字段');
      } else {
        message.error(error.message || '操作失败');
        console.error(error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await window.api.updateClassroomStatus(id, newStatus);
      message.success('状态更新成功');
      loadClassrooms();
    } catch (error) {
      message.error('状态更新失败');
      console.error(error);
    }
  };

  const columns = [
    {
      title: '教室号',
      dataIndex: 'room_number',
      key: 'room_number',
      width: 150,
      sorter: (a, b) => a.room_number.localeCompare(b.room_number),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
          size="small"
        >
          <Option value="available">
            <Tag color={STATUS_COLORS.available}>{STATUS_LABELS.available}</Tag>
          </Option>
          <Option value="unavailable">
            <Tag color={STATUS_COLORS.unavailable}>{STATUS_LABELS.unavailable}</Tag>
          </Option>
          <Option value="self-study">
            <Tag color={STATUS_COLORS['self-study']}>{STATUS_LABELS['self-study']}</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该教室？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">教室信息</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加教室
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={classrooms}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showTotal: (total) => `共 ${total} 个教室`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        size="small"
      />

      <Modal
        title={editingClassroom ? '编辑教室' : '添加教室'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="教室号"
            name="room_number"
            rules={[{ required: true, message: '请输入教室号' }]}
          >
            <Input placeholder="如：101、202" />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="available">可用</Option>
              <Option value="unavailable">不可用</Option>
              <Option value="self-study">自习室</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ClassroomManagement;
