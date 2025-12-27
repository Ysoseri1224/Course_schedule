import { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <MainContent />
    </div>
  );
}

export default Layout;
