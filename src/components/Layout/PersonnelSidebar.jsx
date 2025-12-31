import { useState, useEffect } from 'react';
import { Button, Input, Modal, message } from 'antd';
import { Users, BookOpen, Wrench, LogOut, PlusCircle, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useScheduleStore } from '../../store/scheduleStore';

function PersonnelSidebar() {
  const { currentUser, logout } = useAuthStore();
  const { personnelTab, setPersonnelTab, students, teachers, loadStudents, loadTeachers, activePersonnelStudentId, setActivePersonnelStudent, activePersonnelTeacherId, setActivePersonnelTeacher } = useScheduleStore();
  const [studentSearchText, setStudentSearchText] = useState('');
  const [teacherSearchText, setTeacherSearchText] = useState('');
  
  useEffect(() => {
    loadStudents();
    loadTeachers();
  }, []);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">人员管理</h1>
        <p className="text-sm text-gray-500 mt-1">Personnel Management</p>
      </div>

      <div className="flex flex-col p-4 space-y-2">
        <button
          onClick={() => setPersonnelTab('student-info')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            personnelTab === 'student-info'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users size={18} />
          <span>学员信息</span>
        </button>
        <button
          onClick={() => setPersonnelTab('teacher-info')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            personnelTab === 'teacher-info'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BookOpen size={18} />
          <span>教师信息</span>
        </button>
        <button
          onClick={() => setPersonnelTab('auxiliary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            personnelTab === 'auxiliary'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Wrench size={18} />
          <span>辅助功能</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {personnelTab === 'student-info' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">学员列表</span>
            </div>
            <div className="mb-3">
              <Input
                placeholder="搜索学员姓名..."
                prefix={<Search size={16} className="text-gray-400" />}
                value={studentSearchText}
                onChange={(e) => setStudentSearchText(e.target.value)}
                allowClear
                size="small"
              />
            </div>
            {students.filter(student => 
              student.name.toLowerCase().includes(studentSearchText.toLowerCase())
            ).map(student => (
              <button
                key={student.id}
                onClick={() => setActivePersonnelStudent(student.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activePersonnelStudentId === student.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {student.name}
              </button>
            ))}
          </div>
        )}

        {personnelTab === 'teacher-info' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">教师列表</span>
            </div>
            <div className="mb-3">
              <Input
                placeholder="搜索教师姓名..."
                prefix={<Search size={16} className="text-gray-400" />}
                value={teacherSearchText}
                onChange={(e) => setTeacherSearchText(e.target.value)}
                allowClear
                size="small"
              />
            </div>
            {teachers.map(teacher => (
              <button
                key={teacher.id}
                onClick={() => setActivePersonnelTeacher(teacher.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activePersonnelTeacherId === teacher.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {teacher.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 用户信息区域 - 底部 */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {currentUser?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-gray-800">{currentUser?.username}</div>
              <div className="text-xs text-gray-500">
                {currentUser?.role === 'admin' ? '管理员' : '普通用户'}
              </div>
            </div>
          </div>
          <Button
            type="text"
            size="small"
            icon={<LogOut size={16} />}
            onClick={logout}
            danger
            title="退出登录"
          />
        </div>
      </div>
    </div>
  );
}

export default PersonnelSidebar;
