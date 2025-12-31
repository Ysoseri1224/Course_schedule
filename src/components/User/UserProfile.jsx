import { useState } from 'react';
import { Modal, Input, message, Upload, Avatar } from 'antd';
import { User, Lock, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

function UserProfile({ visible, onClose }) {
  const { currentUser, setCurrentUser } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      message.warning('请填写所有密码字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      message.warning('新密码长度至少为6位');
      return;
    }

    try {
      // 先验证旧密码
      const user = await window.api.login(currentUser.username, oldPassword);
      if (!user) {
        message.error('原密码错误');
        return;
      }

      // 修改密码
      await window.api.changePassword(currentUser.id, newPassword);
      message.success('密码修改成功');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      message.error('修改密码失败：' + error.message);
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      // 这里可以处理头像上传
      message.success('头像上传成功');
    }
  };

  return (
    <Modal
      title="个人信息"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <div className="space-y-6">
        {/* 头像部分 */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <Avatar
              size={100}
              icon={<User />}
              src={avatarUrl}
              className="bg-blue-500"
            >
              {!avatarUrl && currentUser?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setAvatarUrl(e.target.result);
                  setCurrentUser({ ...currentUser, avatar: e.target.result });
                };
                reader.readAsDataURL(file);
                return false;
              }}
            >
              <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors">
                <Camera size={16} />
              </button>
            </Upload>
          </div>
          <div className="mt-4 text-center">
            <div className="text-xl font-semibold">{currentUser?.username}</div>
            <div className="text-sm text-gray-500 mt-1">
              {currentUser?.role === 'admin' ? '管理员' : '普通用户'}
            </div>
          </div>
        </div>

        {/* 修改密码部分 */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-gray-600" />
            <span className="font-semibold">修改密码</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">原密码</label>
              <Input.Password
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="请输入原密码"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">新密码</label>
              <Input.Password
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少6位）"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">确认新密码</label>
              <Input.Password
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              修改密码
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UserProfile;
