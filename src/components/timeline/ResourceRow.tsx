import React from 'react';
import dayjs from 'dayjs';
import { Popover } from 'antd';
import { System, Plan } from '../../types';
import { ROW_HEIGHT, SIDEBAR_WIDTH } from './constants';
import { ConflictEngine } from '../../utils/conflictEngine';

interface ResourceRowProps {
  system: System;
  plans: Plan[];
  startDate: dayjs.Dayjs;
  days: number;
}

const ResourceRow: React.FC<ResourceRowProps> = ({ system, plans, startDate, days }) => {
  // 找出所有涉及该系统的计划
  const relevantPlans = plans.filter(p => p.systems.includes(system.id));

  // 检测冲突 (这里简化处理，只标记重叠区域，实际上 ConflictEngine 返回的是具体的冲突对象)
  // 为了可视化，我们需要把计划渲染成块
  // 关键：OuterGray 和 FullRelease 需要特别标注

  return (
    <div className="flex border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" style={{ height: ROW_HEIGHT }}>
      <div 
        className="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-center px-4 bg-white dark:bg-gray-900 sticky left-0 z-10"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="font-medium text-gray-800 dark:text-gray-200 truncate" title={system.name}>{system.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={system.department}>{system.department}</div>
      </div>
      
      <div className="relative flex-grow flex">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex pointer-events-none w-full">
          {Array.from({ length: days }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 border-r border-gray-100 dark:border-gray-800 h-full" 
            />
          ))}
        </div>

        {/* Plan Blocks */}
        {relevantPlans.map(plan => {
          const schedule = plan.schedule;
          // 我们只渲染从 TestStart 到 FullReleaseEnd 的整个条，
          // 但重点高亮 OuterGray 和 FullRelease
          
          // 确定有效的展示开始时间（test -> inner -> outer）
          const effectiveStartStr = schedule.testStart || schedule.innerGrayStart || schedule.outerGrayStart;
          if (!effectiveStartStr || !schedule.fullReleaseEnd) return null;

          const start = dayjs(effectiveStartStr);
          const end = dayjs(schedule.fullReleaseEnd);
          
          const offsetDays = start.diff(startDate, 'day');
          const durationDays = end.diff(start, 'day') + 1; // inclusive

          if (end.isBefore(startDate) || start.isAfter(startDate.add(days, 'day'))) return null;

          // Calculate percentage based position and width
          const leftPercent = (offsetDays / days) * 100;
          const widthPercent = (durationDays / days) * 100;

          // 计算各阶段的宽度比例 (处理空值)
          const testDuration = schedule.testStart && schedule.testEnd 
            ? dayjs(schedule.testEnd).diff(dayjs(schedule.testStart), 'day') + 1 
            : 0;
          
          const innerDuration = schedule.innerGrayStart && schedule.innerGrayEnd 
            ? dayjs(schedule.innerGrayEnd).diff(dayjs(schedule.innerGrayStart), 'day') + 1 
            : 0;
            
          const outerDuration = dayjs(schedule.outerGrayEnd).diff(dayjs(schedule.outerGrayStart), 'day') + 1;
          const fullDuration = dayjs(schedule.fullReleaseEnd).diff(dayjs(schedule.fullReleaseStart), 'day') + 1;

          // 检查是否与其他计划冲突
          const conflicts = ConflictEngine.checkConflicts(plan, plans, [system]);
          
          // 这里的冲突检测是 Plan 级别的，我们需要精确知道这个 System 是否冲突
          // 上面的 checkConflicts 返回的是 plan 与其他 plan 的冲突列表
          // 我们需要确认当前 system 是否在冲突列表中
          const hasSystemConflict = conflicts.some(c => c.systemId === system.id);

          return (
            <Popover
              key={plan.id}
              title={plan.name}
              content={
                <div className="text-xs">
                  <p>PM: {plan.owner}</p>
                  <p>测试: {schedule.testStart} ~ {schedule.testEnd}</p>
                  <p>内灰: {schedule.innerGrayStart} ~ {schedule.innerGrayEnd}</p>
                  <p className="text-orange-600 font-bold">外灰: {schedule.outerGrayStart} ~ {schedule.outerGrayEnd}</p>
                  <p className="text-red-600 font-bold">全网: {schedule.fullReleaseStart} ~ {schedule.fullReleaseEnd}</p>
                  {hasSystemConflict && <p className="text-red-500 font-bold mt-2">⚠ 存在资源冲突</p>}
                </div>
              }
            >
              <div
                className={`absolute top-2 h-10 rounded-md shadow-sm border text-xs flex items-center overflow-hidden cursor-pointer opacity-90 hover:opacity-100 hover:shadow-md transition-all z-0
                  ${hasSystemConflict ? 'border-red-500 ring-2 ring-red-200' : 'border-blue-200'}
                `}
                style={{ 
                    left: `${leftPercent}%`, 
                    width: `max(${widthPercent}%, 2px)` 
                }}
              >
                {/* 阶段色块可视化 */}
                <div className="h-full flex w-full">
                  {/* Test: Green */}
                  <div style={{ flex: testDuration }} className="bg-green-100 dark:bg-green-900/60 border-r border-white/50 dark:border-white/10 flex items-center justify-center text-green-700 dark:text-green-300" title="测试"></div>
                  {/* Inner: Blue */}
                  <div style={{ flex: innerDuration }} className="bg-blue-100 dark:bg-blue-900/60 border-r border-white/50 dark:border-white/10 flex items-center justify-center text-blue-700 dark:text-blue-300" title="内灰"></div>
                  {/* Outer: Orange (Critical) */}
                  <div style={{ flex: outerDuration }} className={`bg-orange-200 dark:bg-orange-900/60 border-r border-white/50 dark:border-white/10 flex items-center justify-center text-orange-800 dark:text-orange-300 ${hasSystemConflict ? 'animate-pulse bg-red-200 dark:bg-red-900' : ''}`} title="外灰"></div>
                  {/* Full: Red (Critical) */}
                  <div style={{ flex: fullDuration }} className={`bg-red-200 dark:bg-red-900/60 flex items-center justify-center text-red-800 dark:text-red-300 ${hasSystemConflict ? 'animate-pulse bg-red-300 dark:bg-red-800' : ''}`} title="全网"></div>
                </div>
                
                {/* Plan Name Overlay */}
                <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
                  <span className="font-semibold text-gray-700 dark:text-gray-100 truncate drop-shadow-sm">{plan.name}</span>
                </div>
              </div>
            </Popover>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceRow;
