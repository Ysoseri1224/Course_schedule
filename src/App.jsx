import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import { useScheduleStore } from './store/scheduleStore';
import { useAuthStore } from './store/authStore';

function App() {
  const { loadStudents, loadTeachers } = useScheduleStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadStudents();
      loadTeachers();
    }
  }, [isAuthenticated]);

  return (
    <ConfigProvider locale={zhCN}>
      {isAuthenticated ? <Layout /> : <Login />}
    </ConfigProvider>
  );
}

export default App;
