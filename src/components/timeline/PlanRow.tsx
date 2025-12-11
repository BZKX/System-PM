import React from 'react';
import dayjs from 'dayjs';
import { Popover } from 'antd';
import { Plan, System } from '../../types';
import { PIXELS_PER_DAY, ROW_HEIGHT, SIDEBAR_WIDTH } from './constants';
import { ConflictEngine } from '../../utils/conflictEngine';

interface PlanRowProps {
  plan: Plan;
  systems: System[]; // To check for conflicts
  plans: Plan[]; // To check for conflicts against other plans
  startDate: dayjs.Dayjs;
  days: number;
}

const PlanRow: React.FC<PlanRowProps> = ({ plan, systems, plans, startDate, days }) => {
  const schedule = plan.schedule;
  
  // 确定有效的展示开始时间（test -> inner -> outer）
  const effectiveStartStr = schedule.testStart || schedule.innerGrayStart || schedule.outerGrayStart;
  if (!effectiveStartStr || !schedule.fullReleaseEnd) return null; // Or render empty/placeholder

  const start = dayjs(effectiveStartStr);
  const end = dayjs(schedule.fullReleaseEnd);
  
  const offsetDays = start.diff(startDate, 'day');
  const durationDays = end.diff(start, 'day') + 1; // inclusive

  const left = offsetDays * PIXELS_PER_DAY;
  const width = durationDays * PIXELS_PER_DAY;

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

  return (
    <div className="flex border-b border-gray-100 hover:bg-blue-50 transition-colors" style={{ height: ROW_HEIGHT }}>
      {/* Sidebar / Header */}
      <div 
        className="flex-shrink-0 border-r border-gray-200 flex flex-col justify-center px-4 bg-white sticky left-0 z-10"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="font-medium text-gray-800 truncate" title={plan.name}>{plan.name}</div>
        <div className="text-xs text-gray-500 truncate mt-1">PM: {plan.owner}</div>
        <div className="text-xs text-gray-400 truncate mt-0.5">系统: {plan.systems.length}个</div>
      </div>
      
      {/* Timeline Content */}
      <div className="relative flex-grow" style={{ width: days * PIXELS_PER_DAY }}>
        {/* Grid Lines */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: days }).map((_, i) => (
            <div 
              key={i} 
              className="border-r border-gray-100 h-full" 
              style={{ width: PIXELS_PER_DAY }}
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
                style={{ left, width: Math.max(width, 2) }}
              >
                <div className="h-full flex w-full">
                  <div style={{ flex: testDuration }} className="bg-green-100 border-r border-white/50 flex items-center justify-center text-green-700" title="测试">T</div>
                  <div style={{ flex: innerDuration }} className="bg-blue-100 border-r border-white/50 flex items-center justify-center text-blue-700" title="内灰">I</div>
                  <div style={{ flex: outerDuration }} className={`bg-orange-200 border-r border-white/50 flex items-center justify-center text-orange-800 ${hasConflict ? 'animate-pulse bg-red-200' : ''}`} title="外灰">O</div>
                  <div style={{ flex: fullDuration }} className={`bg-red-200 flex items-center justify-center text-red-800 ${hasConflict ? 'animate-pulse bg-red-300' : ''}`} title="全网">F</div>
                </div>
              </div>
            </Popover>
        )}
      </div>
    </div>
  );
};

export default PlanRow;
