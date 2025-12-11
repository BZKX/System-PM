import React from 'react';
import dayjs from 'dayjs';
import { HEADER_HEIGHT, SIDEBAR_WIDTH } from './constants';

interface TimelineHeaderProps {
  startDate: dayjs.Dayjs;
  days: number;
  sidebarTitle?: string;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ startDate, days, sidebarTitle = "系统 / 时间" }) => {
  const dates = Array.from({ length: days }, (_, i) => startDate.add(i, 'day'));

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10" style={{ height: HEADER_HEIGHT }}>
      <div 
        className="flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex items-center justify-center font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 z-20 sticky left-0"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {sidebarTitle}
      </div>
      <div className="flex flex-1">
        {dates.map((date) => (
          <div
            key={date.format('YYYY-MM-DD')}
            className={`flex-1 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-xs ${
              date.day() === 0 || date.day() === 6 
                ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500' 
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'
            }`}
          >
            <div className="font-medium">{date.format('MM-DD')}</div>
            <div className="scale-75 origin-center">{['日', '一', '二', '三', '四', '五', '六'][date.day()]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineHeader;
