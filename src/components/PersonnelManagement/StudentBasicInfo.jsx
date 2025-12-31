import { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, message, Card } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;

function StudentBasicInfo({ studentId }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const data = await window.api.getStudentDetails(studentId);
      
      if (!data) {
        message.error('未找到学员信息');
        setLoading(false);
        return;
      }
      
      form.setFieldsValue({
        name: data.name,
        gender: data.gender,
        phone: data.phone,
        english_level: data.english_level,
        school: data.school,
        target_score: data.target_score,
        father_name: data.father_name,
        father_phone: data.father_phone,
        mother_name: data.mother_name,
        mother_phone: data.mother_phone,
        status: data.status || '意向学员',
      });
    } catch (error) {
      const errorMsg = error.message || error.toString();
      message.error(`加载学员信息失败: ${errorMsg}`);
      console.error('详细错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      
      await window.api.updateStudentDetails(studentId, values);
      message.success('学员基本信息保存成功');
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

  const targetScoreOptions = [];
  for (let i = 5; i <= 9; i += 0.5) {
    targetScoreOptions.push(i);
  }

  return (
    <Card title="基本信息" loading={loading}>
      <Form
        form={form}
        layout="vertical"
        className="max-w-4xl"
      >
        <Form.Item
          label="姓名"
          name="name"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" disabled />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="性别" name="gender">
            <Select placeholder="请选择性别" allowClear>
              <Option value="男">男</Option>
              <Option value="女">女</Option>
            </Select>
          </Form.Item>

          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="英语水平" name="english_level">
            <Input placeholder="请输入英语水平" />
          </Form.Item>

          <Form.Item label="在读/毕业学校" name="school">
            <Input placeholder="请输入学校名称" />
          </Form.Item>
        </div>

        <Form.Item label="雅思目标分数" name="target_score">
          <Select placeholder="请选择目标分数" allowClear>
            {targetScoreOptions.map(score => (
              <Option key={score} value={score}>{score}</Option>
            ))}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="父亲姓名" name="father_name">
            <Input placeholder="请输入父亲姓名" />
          </Form.Item>

          <Form.Item label="父亲手机号" name="father_phone">
            <Input placeholder="请输入父亲手机号" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="母亲姓名" name="mother_name">
            <Input placeholder="请输入母亲姓名" />
          </Form.Item>

          <Form.Item label="母亲手机号" name="mother_phone">
            <Input placeholder="请输入母亲手机号" />
          </Form.Item>
        </div>

        <Form.Item label="当前状态" name="status">
          <Select placeholder="请选择状态">
            <Option value="意向学员">意向学员</Option>
            <Option value="试听">试听</Option>
            <Option value="已安排课时">已安排课时</Option>
            <Option value="已完成">已完成</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            size="large"
          >
            保存基本信息
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default StudentBasicInfo;
