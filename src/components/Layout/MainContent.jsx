import { useScheduleStore } from '../../store/scheduleStore';
import StudentSchedule from '../Schedule/StudentSchedule';
import TeacherSchedule from '../Schedule/TeacherSchedule';
import TotalSchedule from '../Schedule/TotalSchedule';
import TeacherScheduleOverview from '../Schedule/TeacherScheduleOverview';
import AutoSchedule from '../Schedule/AutoSchedule';
import UserManagement from '../Admin/UserManagement';
import LogViewer from '../Admin/LogViewer';

function MainContent() {
  const { activeTab } = useScheduleStore();

  return (
    <div className="flex-1 overflow-auto">
      {activeTab === 'students' && <StudentSchedule />}
      {activeTab === 'teachers' && <TeacherSchedule />}
      {activeTab === 'total' && <TotalSchedule />}
      {activeTab === 'teacher-overview' && <TeacherScheduleOverview />}
      {activeTab === 'auto-schedule' && <AutoSchedule />}
      {activeTab === 'user-management' && <UserManagement />}
      {activeTab === 'logs' && <LogViewer />}
    </div>
  );
}

export default MainContent;
