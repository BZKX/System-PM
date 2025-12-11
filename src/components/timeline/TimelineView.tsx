import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Button, DatePicker, Segmented, Checkbox } from 'antd';
import { ChevronLeft, ChevronRight, LayoutList, Layers } from 'lucide-react';
import TimelineHeader from './TimelineHeader';
import ResourceRow from './ResourceRow';
import PlanRow from './PlanRow';
import { System, Plan } from '../../types';
import { PIXELS_PER_DAY, SIDEBAR_WIDTH } from './constants';

interface TimelineViewProps {
  systems: System[];
  plans: Plan[];
}

type ViewMode = 'resource' | 'plan';

const TimelineView: React.FC<TimelineViewProps> = ({ systems, plans }) => {
  const [startDate, setStartDate] = useState(dayjs().subtract(2, 'day'));
  const [viewMode, setViewMode] = useState<ViewMode>('resource');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const days = 14; // Display 14 days window (2 weeks)

  const handlePrev = () => setStartDate(startDate.subtract(7, 'day'));
  const handleNext = () => setStartDate(startDate.add(7, 'day'));

  // Calculate view window
  const viewStart = startDate;
  const viewEnd = startDate.add(days, 'day');

  // Filter plans based on view window
  const filteredPlans = useMemo(() => {
    if (!showOnlyActive) return plans;
    return plans.filter(plan => {
      // 确定有效的开始时间
      const effectiveStartStr = plan.schedule.testStart || plan.schedule.innerGrayStart || plan.schedule.outerGrayStart;
      const effectiveEndStr = plan.schedule.fullReleaseEnd;

      if (!effectiveStartStr || !effectiveEndStr) return false;

      const planStart = dayjs(effectiveStartStr);
      const planEnd = dayjs(effectiveEndStr);
      
      // Check for overlap: planStart < viewEnd && planEnd > viewStart
      return planStart.isBefore(viewEnd) && planEnd.isAfter(viewStart);
    });
  }, [plans, viewStart, viewEnd, showOnlyActive]);

  // Filter systems based on filtered plans
  const filteredSystems = useMemo(() => {
    if (!showOnlyActive) return systems;
    
    // Get all system IDs involved in the filtered plans
    const activeSystemIds = new Set<string>();
    filteredPlans.forEach(plan => {
      plan.systems.forEach(sysId => activeSystemIds.add(sysId));
    });

    return systems.filter(sys => activeSystemIds.has(sys.id));
  }, [systems, filteredPlans, showOnlyActive]);

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white sticky left-0 z-30">
        <div className="flex flex-wrap items-center gap-4">
          <Segmented
            options={[
              { label: '系统视图', value: 'resource', icon: <Layers size={14} /> },
              { label: '计划视图', value: 'plan', icon: <LayoutList size={14} /> },
            ]}
            value={viewMode}
            onChange={(val) => setViewMode(val as ViewMode)}
          />
          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <Button icon={<ChevronLeft size={16} />} onClick={handlePrev} />
            <DatePicker 
              value={startDate} 
              onChange={(date) => date && setStartDate(date)} 
              allowClear={false}
              className="w-32"
            />
            <Button icon={<ChevronRight size={16} />} onClick={handleNext} />
            <span className="text-gray-500 text-sm ml-2 hidden sm:inline">2周视图</span>
          </div>
          <Checkbox 
            checked={showOnlyActive} 
            onChange={e => setShowOnlyActive(e.target.checked)}
            className="text-xs text-gray-600"
          >
            仅展示当前时段相关
          </Checkbox>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-300"></div> 测试</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-blue-300"></div> 内灰</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-200 border border-orange-300"></div> 外灰 (关键)</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-200 border border-red-300"></div> 全网 (关键)</div>
        </div>
      </div>

      {/* Scrollable Area */}
      <div className="flex-grow overflow-auto relative">
        <div style={{ minWidth: SIDEBAR_WIDTH + days * PIXELS_PER_DAY }}>
          <TimelineHeader startDate={startDate} days={days} />
          <div className="flex flex-col">
            {viewMode === 'resource' ? (
                // Resource View (Systems)
                <>
                    {filteredSystems.map(system => (
                    <ResourceRow
                        key={system.id}
                        system={system}
                        plans={plans} // Pass all plans for complete rendering context
                        startDate={startDate}
                        days={days}
                    />
                    ))}
                    {filteredSystems.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        {showOnlyActive ? '当前时间段无系统排期活动。' : '暂无系统数据，请先在“系统管理”中添加系统。'}
                    </div>
                    )}
                </>
            ) : (
                // Plan View (Plans)
                <>
                    {filteredPlans.map(plan => (
                        <PlanRow
                            key={plan.id}
                            plan={plan}
                            systems={systems}
                            plans={plans}
                            startDate={startDate}
                            days={days}
                        />
                    ))}
                    {filteredPlans.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            {showOnlyActive ? '当前时间段无计划。' : '暂无计划数据，请先创建计划。'}
                        </div>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
