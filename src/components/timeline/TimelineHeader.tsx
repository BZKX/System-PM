import React from 'react';
import dayjs from 'dayjs';
import { PIXELS_PER_DAY, HEADER_HEIGHT, SIDEBAR_WIDTH } from './constants';

interface TimelineHeaderProps {
  startDate: dayjs.Dayjs;
  days: number;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ startDate, days }) => {
  const dates = Array.from({ length: days }, (_, i) => startDate.add(i, 'day'));

  return (
    <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10" style={{ height: HEADER_HEIGHT }}>
      <div 
        className="flex-shrink-0 border-r border-gray-200 flex items-center justify-center font-semibold text-gray-600 bg-gray-100 z-20 sticky left-0"
        style={{ width: SIDEBAR_WIDTH }}
      >
        系统 / 时间
      </div>
      <div className="flex">
        {dates.map((date) => (
          <div
            key={date.format('YYYY-MM-DD')}
            className={`flex-shrink-0 border-r border-gray-200 flex flex-col items-center justify-center text-xs ${
              date.day() === 0 || date.day() === 6 ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-600'
            }`}
            style={{ width: PIXELS_PER_DAY }}
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
