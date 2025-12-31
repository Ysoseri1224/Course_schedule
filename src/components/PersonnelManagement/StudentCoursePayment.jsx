import { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Button, message, Card, Statistic, Row, Col } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

function StudentCoursePayment({ studentId }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completedHours, setCompletedHours] = useState(0);

  useEffect(() => {
    if (studentId) {
      loadCourseData();
    }
  }, [studentId]);

  const loadCourseData = async () => {
    setLoading(true);
    try {
      const data = await window.api.getStudentDetails(studentId);
      
      if (!data) {
        message.error('未找到学员信息');
        setLoading(false);
        return;
      }
      
      const calculated = await window.api.calculateCompletedHours(studentId);
      
      setCompletedHours(calculated);
      
      form.setFieldsValue({
        course_type: data.course_type,
        total_hours: data.total_hours || 0,
        completed_hours: calculated,
        cancelled_hours: data.cancelled_hours || 0,
        bank_account: data.bank_account,
        tuition_amount: data.tuition_amount,
        payment_status: data.payment_status || '未完成',
      });
    } catch (error) {
      const errorMsg = error.message || error.toString();
      message.error(`加载课程信息失败: ${errorMsg}`);
      console.error('详细错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCompletedHours = async () => {
    try {
      const calculated = await window.api.calculateCompletedHours(studentId);
      setCompletedHours(calculated);
      form.setFieldsValue({ completed_hours: calculated });
      message.success('已更新已完成课时量');
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      
      await window.api.updateStudentDetails(studentId, values);
      message.success('课程与缴费信息保存成功');
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

  const totalHours = form.getFieldValue('total_hours') || 0;
  const remainingHours = totalHours - completedHours - (form.getFieldValue('cancelled_hours') || 0);

  return (
    <Card title="课程与缴费" loading={loading}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Statistic title="总课时量" value={totalHours} suffix="节" />
        </Col>
        <Col span={6}>
          <Statistic title="已完成课时" value={completedHours} suffix="节" valueStyle={{ color: '#3f8600' }} />
        </Col>
        <Col span={6}>
          <Statistic title="已取消课时" value={form.getFieldValue('cancelled_hours') || 0} suffix="节" valueStyle={{ color: '#cf1322' }} />
        </Col>
        <Col span={6}>
          <Statistic title="剩余课时" value={remainingHours} suffix="节" valueStyle={{ color: '#1890ff' }} />
        </Col>
      </Row>

      <Form
        form={form}
        layout="vertical"
        className="max-w-4xl"
      >
        <Form.Item label="课程类型" name="course_type">
          <Select placeholder="请选择课程类型">
            <Option value="对一">对一</Option>
            <Option value="班课">班课</Option>
            <Option value="网课">网课</Option>
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="总课时量" name="total_hours">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="请输入总课时量"
            />
          </Form.Item>

          <Form.Item 
            label={
              <span>
                已完成课时量
                <Button 
                  type="link" 
                  size="small" 
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshCompletedHours}
                >
                  刷新
                </Button>
              </span>
            } 
            name="completed_hours"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              disabled
              placeholder="自动统计"
            />
          </Form.Item>
        </div>

        <Form.Item label="已取消课时数" name="cancelled_hours">
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="请输入已取消课时数"
          />
        </Form.Item>

        <Form.Item label="银行卡号" name="bank_account">
          <Input placeholder="请输入银行卡号" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="应缴费金额（元）" name="tuition_amount">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="请输入应缴费金额"
              precision={2}
            />
          </Form.Item>

          <Form.Item label="缴费状态" name="payment_status">
            <Select placeholder="请选择缴费状态">
              <Option value="已完成">已完成</Option>
              <Option value="未完成">未完成</Option>
            </Select>
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
            保存课程与缴费信息
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default StudentCoursePayment;
