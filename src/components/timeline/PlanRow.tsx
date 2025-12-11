import React from 'react';
import dayjs from 'dayjs';
import { Popover } from 'antd';
import { Plan, System } from '../../types';
import { ROW_HEIGHT, SIDEBAR_WIDTH } from './constants';
import { ConflictEngine } from '../../utils/conflictEngine';

interface PlanRowProps {
  plan: Plan;
  systems: System[]; // To check for conflicts
  plans: Plan[]; // To check for conflicts against other plans
  startDate: dayjs.Dayjs;
  days: number;
  isConflict?: boolean;
}

const PlanRow: React.FC<PlanRowProps> = ({ plan, systems, plans, startDate, days, isConflict }) => {
  const schedule = plan.schedule;
  
  // 确定有效的展示开始时间（test -> inner -> outer）
  const effectiveStartStr = schedule.testStart || schedule.innerGrayStart || schedule.outerGrayStart;
  if (!effectiveStartStr || !schedule.fullReleaseEnd) return null; // Or render empty/placeholder

  const start = dayjs(effectiveStartStr);
  const end = dayjs(schedule.fullReleaseEnd);
  
  const offsetDays = start.diff(startDate, 'day');
  const durationDays = end.diff(start, 'day') + 1; // inclusive

  // Render phases logic (处理空值)
  const testDuration = schedule.testStart && schedule.testEnd 
    ? dayjs(schedule.testEnd).diff(dayjs(schedule.testStart), 'day') + 1 
    : 0;
  
  const innerDuration = schedule.innerGrayStart && schedule.innerGrayEnd 
    ? dayjs(schedule.innerGrayEnd).diff(dayjs(schedule.innerGrayStart), 'day') + 1 
    : 0;

  const outerDuration = dayjs(schedule.outerGrayEnd).diff(dayjs(schedule.outerGrayStart), 'day') + 1;
  const fullDuration = dayjs(schedule.fullReleaseEnd).diff(dayjs(schedule.fullReleaseStart), 'day') + 1;

  // Check conflicts
  const conflicts = ConflictEngine.checkConflicts(plan, plans, systems);
  const hasConflict = conflicts.length > 0;

  // Determine visibility within window
  const isVisible = !(end.isBefore(startDate) || start.isAfter(startDate.add(days, 'day')));

  // Get system names for tooltip
  const systemNames = plan.systems
    .map(id => systems.find(s => s.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  // Calculate percentage based position and width
  const leftPercent = (offsetDays / days) * 100;
  const widthPercent = (durationDays / days) * 100;

  return (
    <div 
        className={`flex border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${isConflict ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}`} 
        style={{ height: ROW_HEIGHT + 20 }}
    >
      {/* Sidebar / Header */}
      <div 
        className={`flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-center px-4 sticky left-0 z-10 ${isConflict ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-900'}`}
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className={`font-medium truncate ${isConflict ? 'text-red-700 dark:text-red-300' : 'text-gray-800 dark:text-gray-200'}`} title={plan.name}>{plan.name}</div>
        <div className={`text-xs truncate mt-1 ${isConflict ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>PM: {plan.owner}</div>
        <div className={`text-xs truncate mt-0.5 ${isConflict ? 'text-red-400 dark:text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>系统: {plan.systems.length}个</div>
      </div>
      
      {/* Timeline Content */}
      <div className="relative flex-grow flex">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex pointer-events-none w-full">
          {Array.from({ length: days }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 border-r border-gray-100 dark:border-gray-800 h-full min-w-[40px]" 
            />
          ))}
        </div>

        {/* Plan Bar */}
        {isVisible && (
            <Popover
              title={plan.name}
              content={
                <div className="text-xs max-w-xs">
                  <p><strong>涉及系统:</strong> {systemNames}</p>
                  <div className="my-2 border-t border-gray-100"></div>
                  <p>测试: {schedule.testStart || '-'} ~ {schedule.testEnd || '-'}</p>
                  <p>内灰: {schedule.innerGrayStart} ~ {schedule.innerGrayEnd}</p>
                  <p className="text-orange-600 font-bold">外灰: {schedule.outerGrayStart} ~ {schedule.outerGrayEnd}</p>
                  <p className="text-red-600 font-bold">全网: {schedule.fullReleaseStart} ~ {schedule.fullReleaseEnd}</p>
                  {hasConflict && (
                      <div className="mt-2 text-red-500">
                          <p className="font-bold">⚠ 发现冲突:</p>
                          <ul className="list-disc pl-4">
                              {conflicts.map((c, i) => (
                                  <li key={i}>{c.systemName} (与 {c.conflictingPlanName})</li>
                              ))}
                          </ul>
                      </div>
                  )}
                </div>
              }
            >
              <div
                className={`absolute top-2 h-10 rounded-md shadow-sm border text-xs flex items-center overflow-hidden cursor-pointer opacity-90 hover:opacity-100 hover:shadow-md transition-all z-0
                  ${hasConflict ? 'border-red-500 ring-2 ring-red-200' : 'border-blue-200'}
                `}
                style={{ 
                    left: `${leftPercent}%`, 
                    width: `max(${widthPercent}%, 2px)` 
                }}
              >
                <div className="h-full flex w-full">
                  <div style={{ flex: testDuration }} className="bg-green-100 dark:bg-green-900/60 border-r border-white/50 dark:border-white/10 flex items-center justify-center text-green-700 dark:text-green-300" title="测试"></div>
                  <div style={{ flex: innerDuration }} className="bg-blue-100 dark:bg-blue-900/60 border-r border-white/50 dark:border-white/10 flex items-center justify-center text-blue-700 dark:text-blue-300" title="内灰"></div>
                  <div style={{ flex: outerDuration }} className={`bg-orange-200 dark:bg-orange-900/60 border-r border-white/50 dark:border-white/10 flex items-center justify-center text-orange-800 dark:text-orange-300 ${hasConflict ? 'animate-pulse bg-red-200 dark:bg-red-900' : ''}`} title="外灰"></div>
                  <div style={{ flex: fullDuration }} className={`bg-red-200 dark:bg-red-900/60 flex items-center justify-center text-red-800 dark:text-red-300 ${hasConflict ? 'animate-pulse bg-red-300 dark:bg-red-800' : ''}`} title="全网"></div>
                </div>
              </div>
            </Popover>
        )}
      </div>
    </div>
  );
};

export default PlanRow;
