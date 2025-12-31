import { useState, useEffect } from 'react';
import { Table, Button, message, Popconfirm, Tag, Modal } from 'antd';
import { Trash2, RefreshCw } from 'lucide-react';

function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await window.api.getLogs(200);
      setLogs(data);
    } catch (error) {
      message.error('加载日志失败');
    }
    setLoading(false);
  };

  const handleClearLogs = async () => {
    try {
      await window.api.clearLogs();
      message.success('日志已清空');
      loadLogs();
    } catch (error) {
      message.error('清空日志失败');
    }
  };

  const handleRowDoubleClick = (record) => {
    if (record.level !== 'info' && record.details) {
      setSelectedLog(record);
      setDetailModalVisible(true);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => {
        const colorMap = {
          info: 'blue',
          warning: 'orange',
          error: 'red',
        };
        return (
          <Tag color={colorMap[level]}>
            {level.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '详细信息',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details, record) => {
        if (record.level === 'info') return '-';
        return details || '-';
      },
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">系统日志</h2>
        <div className="space-x-2">
          <Button icon={<RefreshCw size={16} />} onClick={loadLogs}>
            刷新
          </Button>
          <Popconfirm
            title="确定要清空所有日志吗？"
            onConfirm={handleClearLogs}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<Trash2 size={16} />}>
              清空日志
            </Button>
          </Popconfirm>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}

export default LogViewer;
