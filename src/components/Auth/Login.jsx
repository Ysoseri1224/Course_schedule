import { useState } from 'react';
import { Input, Button, message } from 'antd';
import { User, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import logoImg from '/logo.png';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!username || !password) {
      message.error('请输入用户名和密码');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      message.success('登录成功');
    } else {
      message.error(result.error || '登录失败');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <img src={logoImg} alt="创锦国际教育" />
        </div>
        <h1 className="login-title">创锦排课系统</h1>
        <p className="login-subtitle">Schedule Management System</p>

        <div className="login-form">
          <div className="login-input-group">
            <User size={20} className="login-input-icon" />
            <Input
              size="large"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="login-input"
            />
          </div>

          <div className="login-input-group">
            <Lock size={20} className="login-input-icon" />
            <Input.Password
              size="large"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="login-input"
            />
          </div>

          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleLogin}
            className="login-button"
          >
            登录
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
