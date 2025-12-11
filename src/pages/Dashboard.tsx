import React from 'react';
import TimelineView from '../components/timeline/TimelineView';
import QuickCheckWidget from '../components/dashboard/QuickCheckWidget';
import { useAppStore } from '../store/useAppStore';

const Dashboard: React.FC = () => {
  const { systems, plans } = useAppStore();

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">系统排期仪表盘</h2>
        <p className="text-sm text-gray-500">直观查看各系统的占用情况与冲突风险。</p>
      </div>
      
      {/* 快速冲突检测挂件 */}
      <QuickCheckWidget />

      <div className="flex-grow min-h-0">
        <TimelineView systems={systems} plans={plans} />
      </div>
    </div>
  );
};

export default Dashboard;
