import { useState } from 'react';
import { Button, Input, Modal, message, Dropdown, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { PlusCircle, Users, BookOpen, Calendar, MoreVertical, Settings, Trash2, LogOut, User, Shield, FileText, ChevronUp, ChevronDown, Database, Clock, Search, BarChart } from 'lucide-react';
import { useScheduleStore } from '../../store/scheduleStore';
import { useAuthStore } from '../../store/authStore';
import StudentTeacherBinding from '../Settings/StudentTeacherBinding';
import StudentAvailableTimeModal from '../Student/StudentAvailableTimeModal';
import UserProfile from '../User/UserProfile';
import TeacherStatisticsModal from '../Common/TeacherStatisticsModal';

function Sidebar() {
  const {
    students,
    teachers,
    activeTab,
    activeStudentId,
    activeTeacherId,
    setActiveTab,
    setActiveStudent,
    setActiveTeacher,
    addStudent,
    addTeacher,
    updateStudent,
    deleteStudent,
    deleteTeacher,
  } = useScheduleStore();
  
  const { currentUser, logout } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newName, setNewName] = useState('');
  const [newTotalHours, setNewTotalHours] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bindingModalVisible, setBindingModalVisible] = useState(false);
  const [bindingStudentId, setBindingStudentId] = useState(null);
  const [availableTimeModalVisible, setAvailableTimeModalVisible] = useState(false);
  const [availableTimeStudent, setAvailableTimeStudent] = useState(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [adminMenuExpanded, setAdminMenuExpanded] = useState(false);
  const [studentSearchText, setStudentSearchText] = useState('');
  const [statisticsModalVisible, setStatisticsModalVisible] = useState(false);
  const [statisticsTeacher, setStatisticsTeacher] = useState(null);

  const handleAdd = async () => {
    if (!newName.trim()) {
      message.warning('请输入姓名');
      return;
    }

    try {
      if (activeTab === 'students') {
        await addStudent({
          name: newName.trim(),
          totalHours: parseInt(newTotalHours) || 0,
          startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
          endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
        }, currentUser);
        message.success('学生添加成功');
      } else if (activeTab === 'teachers') {
        await addTeacher({
          name: newName.trim(),
          subjects: [],
        }, currentUser);
        message.success('教师添加成功');
      }

      setIsAddModalVisible(false);
      setNewName('');
      setNewTotalHours('');
      setStartDate(null);
      setEndDate(null);
    } catch (error) {
      console.error('添加失败:', error);
      message.error('添加失败，请重试');
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">创锦排课系统</h1>
        <p className="text-sm text-gray-500 mt-1">Schedule Management</p>
      </div>

      <div className="flex flex-col p-4 space-y-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'students'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users size={18} />
          <span>学生</span>
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'teachers'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BookOpen size={18} />
          <span>教师</span>
        </button>
        <button
          onClick={() => setActiveTab('teacher-overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'teacher-overview'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BookOpen size={18} />
          <span>教师总排班</span>
        </button>
        <button
          onClick={() => setActiveTab('total')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'total'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar size={18} />
          <span>总课表</span>
        </button>
        <button
          onClick={() => setActiveTab('auto-schedule')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'auto-schedule'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Clock size={18} />
          <span>自动排课</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'students' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">学生列表</span>
              <button
                onClick={() => setIsAddModalVisible(true)}
                className="text-blue-500 hover:text-blue-600"
              >
                <PlusCircle size={20} />
              </button>
            </div>
            <div className="mb-3">
              <Input
                placeholder="搜索学生姓名..."
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
              <div key={student.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveStudent(student.id)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors ${
                    activeStudentId === student.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {student.name}
                </button>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'available-time',
                        label: '设置可排课时段',
                        icon: <Clock size={14} />,
                        onClick: () => {
                          setAvailableTimeStudent(student);
                          setAvailableTimeModalVisible(true);
                        },
                      },
                      {
                        key: 'settings',
                        label: '设置教师',
                        icon: <Settings size={14} />,
                        onClick: () => {
                          setBindingStudentId(student.id);
                          setBindingModalVisible(true);
                        },
                      },
                      {
                        key: 'edit',
                        label: '编辑',
                        icon: <Settings size={14} />,
                        onClick: () => {
                          setEditingStudent(student);
                          setNewName(student.name);
                          setNewTotalHours(student.total_hours?.toString() || '0');
                          setStartDate(student.start_date ? dayjs(student.start_date) : null);
                          setEndDate(student.end_date ? dayjs(student.end_date) : null);
                          setIsEditModalVisible(true);
                        },
                      },
                      {
                        key: 'delete',
                        label: '删除',
                        icon: <Trash2 size={14} />,
                        danger: true,
                        onClick: () => {
                          Modal.confirm({
                            title: '确认删除',
                            content: `确定要删除学生"${student.name}"吗？`,
                            onOk: () => deleteStudent(student.id, currentUser, student.name),
                          });
                        },
                      },
                    ],
                  }}
                  trigger={['click']}
                >
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <MoreVertical size={16} />
                  </button>
                </Dropdown>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">教师列表</span>
              <button
                onClick={() => setIsAddModalVisible(true)}
                className="text-blue-500 hover:text-blue-600"
              >
                <PlusCircle size={20} />
              </button>
            </div>
            {teachers.map(teacher => (
              <div key={teacher.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTeacher(teacher.id)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTeacherId === teacher.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {teacher.name}
                </button>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'statistics',
                        label: '课时统计',
                        icon: <BarChart size={14} />,
                        onClick: () => {
                          setStatisticsTeacher(teacher);
                          setStatisticsModalVisible(true);
                        },
                      },
                      {
                        key: 'delete',
                        label: '删除',
                        icon: <Trash2 size={14} />,
                        danger: true,
                        onClick: () => {
                          Modal.confirm({
                            title: '确认删除',
                            content: `确定要删除教师"${teacher.name}"吗？`,
                            onOk: () => deleteTeacher(teacher.id, currentUser, teacher.name),
                          });
                        },
                      },
                    ],
                  }}
                  trigger={['click']}
                >
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <MoreVertical size={16} />
                  </button>
                </Dropdown>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'total' && (
          <div className="text-sm text-gray-500 text-center mt-4">
            查看所有学生和教师的课程安排
          </div>
        )}
      </div>

      <Modal
        title={activeTab === 'students' ? '添加学生' : '添加教师'}
        open={isAddModalVisible}
        onOk={handleAdd}
        onCancel={() => {
          setIsAddModalVisible(false);
          setNewName('');
          setNewTotalHours('');
          setStartDate(null);
          setEndDate(null);
        }}
        okText="确定"
        cancelText="取消"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">姓名</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="请输入姓名"
            />
          </div>
          {activeTab === 'students' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">总课时</label>
                <Input
                  type="number"
                  value={newTotalHours}
                  onChange={(e) => setNewTotalHours(e.target.value)}
                  placeholder="请输入总课时"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">开始日期</label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="选择开始日期"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">结束日期（可选）</label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="选择结束日期"
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  disabled={!startDate}
                  disabledDate={(current) => startDate && current < startDate}
                />
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        title="编辑学生"
        open={isEditModalVisible}
        onOk={async () => {
          if (!newName.trim() || !editingStudent) {
            message.warning('请输入学生姓名');
            return;
          }
          await updateStudent(editingStudent.id, {
            name: newName.trim(),
            totalHours: parseInt(newTotalHours) || 0,
            startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
            endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
          }, currentUser);
          message.success('学生信息已更新');
          setIsEditModalVisible(false);
          setEditingStudent(null);
          setNewName('');
          setNewTotalHours('');
          setStartDate(null);
          setEndDate(null);
        }}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingStudent(null);
          setNewName('');
          setNewTotalHours('');
          setStartDate(null);
          setEndDate(null);
        }}
        okText="确定"
        cancelText="取消"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">姓名</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">总课时</label>
            <Input
              type="number"
              value={newTotalHours}
              onChange={(e) => setNewTotalHours(e.target.value)}
              placeholder="请输入总课时"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">开始日期</label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="选择开始日期"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">结束日期（可选）</label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="选择结束日期"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              disabled={!startDate}
              disabledDate={(current) => startDate && current < startDate}
            />
          </div>
        </div>
      </Modal>

      <StudentTeacherBinding
        visible={bindingModalVisible}
        onClose={() => setBindingModalVisible(false)}
        studentId={bindingStudentId}
      />

      <StudentAvailableTimeModal
        open={availableTimeModalVisible}
        student={availableTimeStudent}
        onClose={() => {
          setAvailableTimeModalVisible(false);
          setAvailableTimeStudent(null);
        }}
        onSave={() => {
          // 可选：保存后的回调
        }}
      />

      {/* 管理员展开菜单 */}
      {isAdmin && adminMenuExpanded && (
        <div className="border-t border-gray-200 bg-red-50 p-3 space-y-2">
          <div className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
            <Shield size={14} /> 管理员功能
          </div>
          <button
            onClick={() => { setActiveTab('user-management'); setAdminMenuExpanded(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === 'user-management'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 hover:bg-red-100'
            }`}
          >
            <Users size={16} />
            <span>用户管理</span>
          </button>
          <button
            onClick={() => { setActiveTab('logs'); setAdminMenuExpanded(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === 'logs'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 hover:bg-red-100'
            }`}
          >
            <FileText size={16} />
            <span>系统日志</span>
          </button>
          <button
            onClick={async () => {
              try {
                await window.api.insertTestData();
                message.success('测试数据生成成功');
                const { loadStudents, loadTeachers } = useScheduleStore.getState();
                await loadStudents();
                await loadTeachers();
              } catch (error) {
                message.error('生成测试数据失败：' + error.message);
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white text-gray-700 hover:bg-red-100 transition-colors"
          >
            <Database size={16} />
            <span>生成测试数据</span>
          </button>
          <button
            onClick={() => {
              Modal.confirm({
                title: '确认删除所有数据？',
                content: '此操作将删除所有学生、教师、课程数据，但不会删除用户账号。此操作不可恢复！',
                okText: '确认删除',
                cancelText: '取消',
                okButtonProps: { danger: true },
                onOk: async () => {
                  try {
                    await window.api.deleteAllData();
                    message.success('所有数据已删除');
                    const { loadStudents, loadTeachers } = useScheduleStore.getState();
                    await loadStudents();
                    await loadTeachers();
                  } catch (error) {
                    message.error('删除数据失败：' + error.message);
                  }
                },
              });
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white text-red-600 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} />
            <span>删除所有数据</span>
          </button>
        </div>
      )}

      {/* 用户信息区域 - 底部 */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 mt-auto">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              if (isAdmin) {
                setAdminMenuExpanded(!adminMenuExpanded);
              } else {
                setProfileVisible(true);
              }
            }}
            className="flex items-center gap-2 hover:bg-white/50 rounded-lg p-2 transition-colors flex-1"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {currentUser?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-gray-800">{currentUser?.username}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                {isAdmin ? (
                  <><Shield size={12} className="text-red-500" /> 管理员</>
                ) : (
                  <><User size={12} className="text-blue-500" /> 普通用户</>
                )}
              </div>
            </div>
            {isAdmin && (
              adminMenuExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />
            )}
          </button>
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

      {/* 普通用户Profile弹窗 */}
      <UserProfile
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
      />

      {/* 教师课时统计弹窗 */}
      <TeacherStatisticsModal
        visible={statisticsModalVisible}
        teacher={statisticsTeacher}
        onClose={() => {
          setStatisticsModalVisible(false);
          setStatisticsTeacher(null);
        }}
      />
    </div>
  );
}

export default Sidebar;
