import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Card } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;

function TeacherInfo({ teacherId }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teacherId) {
      loadTeacherData();
    }
  }, [teacherId]);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const data = await window.api.getTeacherDetails(teacherId);
      
      if (!data) {
        message.error('未找到教师信息');
        setLoading(false);
        return;
      }
      
      form.setFieldsValue({
        name: data.name,
        username: data.username,
        role: data.role || 'user',
        phone: data.phone,
        email: data.email,
      });
    } catch (error) {
      const errorMsg = error.message || error.toString();
      message.error(`加载教师信息失败: ${errorMsg}`);
      console.error('详细错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      
      // 如果密码为空，则不更新密码
      const updateData = { ...values };
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }
      
      await window.api.updateTeacherDetails(teacherId, updateData);
      message.success('教师信息保存成功');
      
      // 清空密码字段
      form.setFieldsValue({ password: '' });
    } catch (error) {
      if (error.errorFields) {
        message.warning('请填写必填字段');
      } else {
        message.error('保存失败');
        console.error(error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="教师信息" loading={loading}>
      <Form
        form={form}
        layout="vertical"
        className="max-w-4xl"
      >
        <Form.Item
          label="姓名"
          name="name"
        >
          <Input placeholder="教师姓名" disabled />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="教师账号"
            name="username"
            rules={[{ required: false, message: '请输入教师账号' }]}
          >
            <Input placeholder="请输入教师账号" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            extra="留空则不修改密码"
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </div>

        <Form.Item
          label="教师身份"
          name="role"
        >
          <Select placeholder="请选择教师身份">
            <Option value="admin">管理员</Option>
            <Option value="user">员工</Option>
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item label="邮箱" name="email">
            <Input type="email" placeholder="请输入邮箱" />
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            size="large"
          >
            保存教师信息
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default TeacherInfo;
