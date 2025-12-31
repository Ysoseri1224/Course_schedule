import TopNavigation from './TopNavigation';
import ScheduleSidebar from './ScheduleSidebar';
import ScheduleContent from './ScheduleContent';
import PersonnelSidebar from './PersonnelSidebar';
import PersonnelContent from './PersonnelContent';
import { useScheduleStore } from '../../store/scheduleStore';

function Layout() {
  const { activeModule, setActiveModule } = useScheduleStore();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopNavigation activeModule={activeModule} onModuleChange={setActiveModule} />
      <div className="flex flex-1 overflow-hidden">
        {activeModule === 'schedule' && (
          <>
            <ScheduleSidebar />
            <ScheduleContent />
          </>
        )}
        {activeModule === 'personnel' && (
          <>
            <PersonnelSidebar />
            <PersonnelContent />
          </>
        )}
      </div>
    </div>
  );
}

export default Layout;
