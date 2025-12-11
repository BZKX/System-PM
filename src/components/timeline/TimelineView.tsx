import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Button, DatePicker, Segmented, Select } from 'antd';
import { ChevronLeft, ChevronRight, LayoutList, Layers } from 'lucide-react';
import TimelineHeader from './TimelineHeader';
import ResourceRow from './ResourceRow';
import PlanRow from './PlanRow';
import { Conflict, System, Plan } from '../../types';
import { SIDEBAR_WIDTH } from './constants';

interface TimelineViewProps {
  systems: System[];
  plans: Plan[];
  highlightedConflicts?: Conflict[] | null;
}

type ViewMode = 'resource' | 'plan';

const TimelineView: React.FC<TimelineViewProps> = ({ systems, plans, highlightedConflicts }) => {
  const [startDate, setStartDate] = useState(dayjs().subtract(2, 'day'));
  const [viewMode, setViewMode] = useState<ViewMode>('resource');
  const [showOnlyActive] = useState(true);
  const [planFilter, setPlanFilter] = useState<string[]>([]);
  const days = 21; // Display 21 days window (3 weeks)

  const handlePrev = () => setStartDate(startDate.subtract(7, 'day'));
  const handleNext = () => setStartDate(startDate.add(7, 'day'));

  // Calculate view window
  const viewStart = startDate;
  const viewEnd = startDate.add(days, 'day');

  // Filter plans based on view window and selection
  const filteredPlans = useMemo(() => {
    let result = plans;
    
    // Apply plan filter if selected (multiple)
    if (planFilter.length > 0) {
      result = result.filter(p => planFilter.includes(p.id));
    } else if (!showOnlyActive) {
      return result;
    }

    return result.filter(plan => {
      // 确定有效的开始时间
      const effectiveStartStr = plan.schedule.testStart || plan.schedule.innerGrayStart || plan.schedule.outerGrayStart;
      const effectiveEndStr = plan.schedule.fullReleaseEnd;

      if (!effectiveStartStr || !effectiveEndStr) return false;

      const planStart = dayjs(effectiveStartStr);
      const planEnd = dayjs(effectiveEndStr);
      
      // Check for overlap: planStart < viewEnd && planEnd > viewStart
      return planStart.isBefore(viewEnd) && planEnd.isAfter(viewStart);
    });
  }, [plans, viewStart, viewEnd, showOnlyActive, planFilter]);

  // Filter systems based on filtered plans
  const filteredSystems = useMemo(() => {
    // If we have highlighted conflicts, prioritize showing involved systems
    if (highlightedConflicts && highlightedConflicts.length > 0) {
        const conflictSystemIds = new Set(highlightedConflicts.map(c => c.systemId));
        return systems.filter(sys => conflictSystemIds.has(sys.id));
    }

    // If specific plans are selected, only show systems involved in those plans
    if (planFilter.length > 0) {
      const selectedPlans = plans.filter(p => planFilter.includes(p.id));
      const involvedSystemIds = new Set<string>();
      selectedPlans.forEach(p => p.systems.forEach(sid => involvedSystemIds.add(sid)));
      return systems.filter(sys => involvedSystemIds.has(sys.id));
    }

    if (!showOnlyActive) return systems;
    
    // Get all system IDs involved in the filtered plans
    const activeSystemIds = new Set<string>();
    filteredPlans.forEach(plan => {
      plan.systems.forEach(sysId => activeSystemIds.add(sysId));
    });

    return systems.filter(sys => activeSystemIds.has(sys.id));
  }, [systems, filteredPlans, showOnlyActive, planFilter, plans, highlightedConflicts]);

  return (
    <div className="flex flex-col h-full border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 sticky left-0 z-30">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <Segmented
            options={[
              { 
                label: (
                  <div className="flex items-center gap-1">
                    <Layers size={14} />
                    <span>系统视图</span>
                  </div>
                ), 
                value: 'resource' 
              },
              { 
                label: (
                  <div className="flex items-center gap-1">
                    <LayoutList size={14} />
                    <span>计划视图</span>
                  </div>
                ), 
                value: 'plan' 
              },
            ]}
            value={viewMode}
            onChange={(val) => setViewMode(val as ViewMode)}
          />
          
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="筛选特定计划"
            className="flex-1 min-w-[200px] max-w-[400px]"
            value={planFilter}
            onChange={setPlanFilter}
            options={plans.map(p => ({ label: p.name, value: p.id }))}
            filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            maxTagCount="responsive"
          />

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <Button icon={<ChevronLeft size={16} />} onClick={handlePrev} />
            <DatePicker 
              value={startDate} 
              onChange={(date) => date && setStartDate(date)} 
              allowClear={false}
              className="w-32"
            />
            <Button icon={<ChevronRight size={16} />} onClick={handleNext} />
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2 hidden sm:inline">3周视图</span>
          </div>
          {/* <Checkbox 
            checked={showOnlyActive} 
            onChange={e => setShowOnlyActive(e.target.checked)}
            className="text-xs text-gray-600 dark:text-gray-400"
          >
            仅展示当前时段相关
          </Checkbox> */}
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs dark:text-gray-300">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-800"></div> 测试</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-800"></div> 内灰</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-200 dark:bg-orange-900/40 border border-orange-300 dark:border-orange-800"></div> 外灰 (关键)</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-200 dark:bg-red-900/40 border border-red-300 dark:border-red-800"></div> 全网 (关键)</div>
        </div>
      </div>

      {/* Scrollable Area */}
      <div className="flex-grow overflow-auto relative">
        <div className="w-full min-w-[800px]">
          <TimelineHeader 
            startDate={startDate} 
            days={days} 
            sidebarTitle={viewMode === 'resource' ? '系统 / 时间' : '计划 / 时间'} 
          />
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
                        isConflict={highlightedConflicts?.some(c => c.systemId === system.id)}
                    />
                    ))}
                    {filteredSystems.length === 0 && (
                    <div className="p-8 text-center text-gray-400 dark:text-gray-500">
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
                            isConflict={highlightedConflicts?.some(c => c.conflictingPlanName === plan.name || c.systemId && plan.systems.includes(c.systemId))}
                        />
                    ))}
                    {filteredPlans.length === 0 && (
                        <div className="p-8 text-center text-gray-400 dark:text-gray-500">
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
