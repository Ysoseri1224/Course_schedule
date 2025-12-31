import { Tabs } from 'antd';
import { useScheduleStore } from '../../store/scheduleStore';
import StudentBasicInfo from '../PersonnelManagement/StudentBasicInfo';
import StudentCoursePayment from '../PersonnelManagement/StudentCoursePayment';
import TeacherInfo from '../PersonnelManagement/TeacherInfo';
import ClassroomManagement from '../PersonnelManagement/ClassroomManagement';
import NotificationSettings from '../PersonnelManagement/NotificationSettings';

function PersonnelContent() {
  const { personnelTab, activePersonnelStudentId, activePersonnelTeacherId } = useScheduleStore();

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-6xl mx-auto">
        {personnelTab === 'student-info' && (
          activePersonnelStudentId ? (
            <Tabs
              defaultActiveKey="basic"
              items={[
                {
                  key: 'basic',
                  label: '基本信息',
                  children: <StudentBasicInfo studentId={activePersonnelStudentId} />
                },
                {
                  key: 'course',
                  label: '课程与缴费',
                  children: <StudentCoursePayment studentId={activePersonnelStudentId} />
                }
              ]}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">请在左侧选择学员</p>
            </div>
          )
        )}
        {personnelTab === 'teacher-info' && (
          activePersonnelTeacherId ? (
            <TeacherInfo teacherId={activePersonnelTeacherId} />
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">请在左侧选择教师</p>
            </div>
          )
        )}
        {personnelTab === 'auxiliary' && (
          <Tabs
            defaultActiveKey="classroom"
            items={[
              {
                key: 'classroom',
                label: '教室信息',
                children: <ClassroomManagement />
              },
              {
                key: 'notification',
                label: '推送提醒',
                children: <NotificationSettings />
              }
            ]}
          />
        )}
      </div>
    </div>
  );
}

export default PersonnelContent;
