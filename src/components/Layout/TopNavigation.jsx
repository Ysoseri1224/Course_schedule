import { Calendar, Users } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

function TopNavigation({ activeModule, onModuleChange }) {
  const modules = [
    { key: 'schedule', label: '排课', icon: Calendar },
    { key: 'personnel', label: '人员管理', icon: Users },
  ];

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex gap-1">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.key}
              onClick={() => onModuleChange(module.key)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeModule === module.key
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              <span>{module.label}</span>
            </button>
          );
        })}
      </div>
      <GlobalSearch />
    </div>
  );
}

export default TopNavigation;
