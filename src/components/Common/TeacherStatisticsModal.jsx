import { useState, useEffect } from 'react';
import { Modal, Spin, Table, Tabs } from 'antd';

function TeacherStatisticsModal({ visible, teacher, onClose }) {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({ yearly: [], monthly: [] });

  useEffect(() => {
    if (visible && teacher) {
      loadStatistics();
    }
  }, [visible, teacher]);

  const loadStatistics = async () => {
    if (!teacher) return;
    setLoading(true);
    try {
      const stats = await window.api.getTeacherStatistics(teacher.id);
      console.log('Statistics received:', stats);
      setStatistics(stats || { yearly: [], monthly: [] });
    } catch (error) {
      console.error('加载统计数据失败:', error);
      setStatistics({ yearly: [], monthly: [] });
    } finally {
      setLoading(false);
    }
  };

  const yearlyColumns = [
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      render: (year) => `${year}年`,
    },
    {
      title: '课时数',
      dataIndex: 'total_hours',
      key: 'total_hours',
      render: (hours) => `${hours}节`,
    },
  ];

  const monthlyColumns = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      render: (month) => {
        const [year, monthNum] = month.split('-');
        return `${year}年${monthNum}月`;
      },
    },
    {
      title: '课时数',
      dataIndex: 'total_hours',
      key: 'total_hours',
      render: (hours) => `${hours}节`,
    },
  ];

  const tabItems = [
    {
      key: 'yearly',
      label: '年度统计',
      children: (
        <Table
          columns={yearlyColumns}
          dataSource={statistics.yearly}
          rowKey="year"
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无年度课时记录' }}
        />
      ),
    },
    {
      key: 'monthly',
      label: '月度统计',
      children: (
        <Table
          columns={monthlyColumns}
          dataSource={statistics.monthly}
          rowKey="month"
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无月度课时记录' }}
        />
      ),
    },
  ];

  return (
    <Modal
      title={`${teacher?.name || ''} - 课时统计`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Spin spinning={loading}>
        <Tabs items={tabItems} />
      </Spin>
    </Modal>
  );
}

export default TeacherStatisticsModal;
