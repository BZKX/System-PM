import React, { useState } from 'react';
import { Card, DatePicker, Button, Alert } from 'antd';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ConflictEngine } from '../../utils/conflictEngine';
import dayjs from 'dayjs';
import { Conflict } from '../../types';
import SystemSelector from '../common/SystemSelector';

const { RangePicker } = DatePicker;

const QuickCheckWidget: React.FC = () => {
  const { systems, plans } = useAppStore();
  const [selectedSystemIds, setSelectedSystemIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[] | null>(null);

  const handleCheck = () => {
    if (!dateRange || selectedSystemIds.length === 0) return;

    const [start, end] = dateRange;
    const result = ConflictEngine.checkAvailability(
      selectedSystemIds,
      start.format('YYYY-MM-DD'),
      end.format('YYYY-MM-DD'),
      plans,
      systems
    );

    setConflicts(result);
  };

  const handleReset = () => {
    setSelectedSystemIds([]);
    setDateRange(null);
    setConflicts(null);
  };

  return (
    <Card 
      className="mb-4 shadow-sm border-blue-100 dark:border-blue-900/50" 
      title={
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <Search size={18} />
          <span>排期冲突速查</span>
        </div>
      }
      size="small"
    >
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">外灰/全网时间段</label>
          <RangePicker 
            className="w-full" 
            value={dateRange}
            onChange={(dates) => {
                // @ts-ignore
                setDateRange(dates);
                setConflicts(null);
            }}
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">涉及系统</label>
          <SystemSelector
            systems={systems}
            placeholder="粘贴系统列表或选择"
            className="w-full"
            value={selectedSystemIds}
            onChange={(vals) => {
                setSelectedSystemIds(vals);
                setConflicts(null);
            }}
          />
        </div>
        <div className="flex gap-2">
            <Button onClick={handleReset}>重置</Button>
            <Button 
                type="primary" 
                onClick={handleCheck} 
                disabled={!dateRange || selectedSystemIds.length === 0}
            >
                查询
            </Button>
        </div>
      </div>

      {conflicts !== null && (
        <div className="mt-4">
          {conflicts.length === 0 ? (
            <Alert
              message="排期可用"
              description="所选时间段内，目标系统未被占用。"
              type="success"
              showIcon
              icon={<CheckCircle />}
            />
          ) : (
            <Alert
              message={`发现 ${conflicts.length} 个冲突`}
              type="error"
              showIcon
              icon={<AlertCircle />}
              description={
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  {conflicts.map((c, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{c.systemName}</span> 被计划 
                      <span className="font-semibold text-blue-600 dark:text-blue-400 mx-1">“{c.conflictingPlanName}”</span> 
                      占用 ({dayjs(c.startDate).format('MM-DD')} ~ {dayjs(c.endDate).format('MM-DD')})
                    </li>
                  ))}
                </ul>
              }
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default QuickCheckWidget;
