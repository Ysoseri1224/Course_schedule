import { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Select, message, Popconfirm, Space } from 'antd';
import { UserPlus, Trash2, Key } from 'lucide-react';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await window.api.getAllUsers();
      setUsers(data);
    } catch (error) {
      message.error('加载用户列表失败');
    }
    setLoading(false);
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      message.error('请填写用户名和密码');
      return;
    }

    try {
      await window.api.createUser(newUser.username, newUser.password, newUser.role);
      message.success('用户创建成功');
      setIsModalOpen(false);
      setNewUser({ username: '', password: '', role: 'user' });
      loadUsers();
    } catch (error) {
      message.error('创建用户失败：' + error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await window.api.deleteUser(id);
      message.success('用户删除成功');
      loadUsers();
    } catch (error) {
      message.error('删除用户失败：' + error.message);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      message.error('请输入新密码');
      return;
    }

    try {
      await window.api.changePassword(selectedUser.id, newPassword);
      message.success('密码修改成功');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error) {
      message.error('修改密码失败');
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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <span className={`px-2 py-1 rounded text-sm ${role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<Key size={14} />}
            onClick={() => {
              setSelectedUser(record);
              setIsPasswordModalOpen(true);
            }}
          >
            改密
          </Button>
          {record.role !== 'admin' && (
            <Popconfirm
              title="确定要删除该用户吗？"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button size="small" danger icon={<Trash2 size={14} />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <Button type="primary" icon={<UserPlus size={16} />} onClick={() => setIsModalOpen(true)}>
          添加用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* 创建用户 Modal */}
      <Modal
        title="创建用户"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setNewUser({ username: '', password: '', role: 'user' });
        }}
        onOk={handleCreateUser}
        okText="创建"
        cancelText="取消"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2">用户名</label>
            <Input
              placeholder="请输入用户名"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block mb-2">密码</label>
            <Input.Password
              placeholder="请输入密码"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block mb-2">角色</label>
            <Select
              style={{ width: '100%' }}
              value={newUser.role}
              onChange={(value) => setNewUser({ ...newUser, role: value })}
            >
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </div>
        </div>
      </Modal>

      {/* 修改密码 Modal */}
      <Modal
        title={`修改密码 - ${selectedUser?.username}`}
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          setNewPassword('');
          setSelectedUser(null);
        }}
        onOk={handleChangePassword}
        okText="确定"
        cancelText="取消"
      >
        <div>
          <label className="block mb-2">新密码</label>
          <Input.Password
            placeholder="请输入新密码"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export default UserManagement;
