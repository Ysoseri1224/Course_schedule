import { useState, useEffect, useMemo } from 'react';
import { Input, Dropdown } from 'antd';
import { Search, Users, BookOpen, Calendar, Clock, Wrench, ChevronRight } from 'lucide-react';
import { useScheduleStore } from '../../store/scheduleStore';

function GlobalSearch() {
  const [searchText, setSearchText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { students, teachers, setActiveModule, setActiveTab, setPersonnelTab, setActiveStudent, setActiveTeacher } = useScheduleStore();

  const searchIndex = useMemo(() => {
    const items = [];

    // 排课模块功能
    items.push({
      type: 'module',
      icon: Users,
      label: '学生',
      keywords: ['学生', 'student'],
      action: () => {
        setActiveModule('schedule');
        setActiveTab('students');
      }
    });

    items.push({
      type: 'module',
      icon: BookOpen,
      label: '教师',
      keywords: ['教师', 'teacher'],
      action: () => {
        setActiveModule('schedule');
        setActiveTab('teachers');
      }
    });

    items.push({
      type: 'module',
      icon: BookOpen,
      label: '教师总排班',
      keywords: ['教师总排班', 'teacher overview', '排班'],
      action: () => {
        setActiveModule('schedule');
        setActiveTab('teacher-overview');
      }
    });

    items.push({
      type: 'module',
      icon: Calendar,
      label: '总课表',
      keywords: ['总课表', 'total schedule', '课表'],
      action: () => {
        setActiveModule('schedule');
        setActiveTab('total');
      }
    });

    items.push({
      type: 'module',
      icon: Clock,
      label: '自动排课',
      keywords: ['自动排课', 'auto schedule', '排课'],
      action: () => {
        setActiveModule('schedule');
        setActiveTab('auto-schedule');
      }
    });

    // 人员管理模块功能
    items.push({
      type: 'module',
      icon: BookOpen,
      label: '教师信息',
      keywords: ['教师信息', 'teacher info'],
      action: () => {
        setActiveModule('personnel');
        setPersonnelTab('teacher-info');
      }
    });

    items.push({
      type: 'module',
      icon: Users,
      label: '学员信息',
      keywords: ['学员信息', 'student info'],
      action: () => {
        setActiveModule('personnel');
        setPersonnelTab('student-info');
      }
    });

    items.push({
      type: 'module',
      icon: Wrench,
      label: '辅助功能',
      keywords: ['辅助功能', 'auxiliary'],
      action: () => {
        setActiveModule('personnel');
        setPersonnelTab('auxiliary');
      }
    });

    // 学生数据
    students.forEach(student => {
      items.push({
        type: 'student',
        icon: Users,
        label: student.name,
        subLabel: '学生',
        keywords: [student.name, 'student', '学生'],
        action: () => {
          setActiveModule('schedule');
          setActiveTab('students');
          setActiveStudent(student.id);
        }
      });
    });

    // 教师数据
    teachers.forEach(teacher => {
      items.push({
        type: 'teacher',
        icon: BookOpen,
        label: teacher.name,
        subLabel: '教师',
        keywords: [teacher.name, 'teacher', '教师'],
        action: () => {
          setActiveModule('schedule');
          setActiveTab('teachers');
          setActiveTeacher(teacher.id);
        }
      });
    });

    return items;
  }, [students, teachers, setActiveModule, setActiveTab, setPersonnelTab, setActiveStudent, setActiveTeacher]);

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];

    const query = searchText.toLowerCase().trim();
    return searchIndex.filter(item => 
      item.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
      item.label.toLowerCase().includes(query)
    ).slice(0, 8); // 最多显示8个结果
  }, [searchText, searchIndex]);

  const handleSelect = (item) => {
    item.action();
    setSearchText('');
    setDropdownOpen(false);
  };

  const getTypeLabel = (type) => {
    const labels = {
      module: '功能',
      student: '学生',
      teacher: '教师'
    };
    return labels[type] || '';
  };

  const menuItems = searchResults.map((item, index) => {
    const Icon = item.icon;
    return {
      key: index,
      label: (
        <div className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
          <div className="flex items-center gap-3">
            <Icon size={16} className="text-gray-500" />
            <div>
              <div className="font-medium text-gray-800">{item.label}</div>
              {item.subLabel && (
                <div className="text-xs text-gray-500">{item.subLabel}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {getTypeLabel(item.type)}
            </span>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
        </div>
      ),
      onClick: () => handleSelect(item)
    };
  });

  return (
    <Dropdown
      menu={{ items: menuItems }}
      open={dropdownOpen && searchResults.length > 0}
      onOpenChange={setDropdownOpen}
      placement="bottomRight"
      overlayStyle={{ minWidth: 320 }}
    >
      <Input
        placeholder="搜索功能、字段"
        prefix={<Search size={16} className="text-gray-400" />}
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setDropdownOpen(true);
        }}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
        style={{ width: 280 }}
        allowClear
      />
    </Dropdown>
  );
}

export default GlobalSearch;
