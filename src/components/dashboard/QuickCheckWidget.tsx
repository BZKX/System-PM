import React, { useState } from 'react';
import { Card, DatePicker, Button, Alert, Tag, Tooltip } from 'antd';
import { Search, AlertCircle, CheckCircle, History, Clock } from 'lucide-react';
import { useAppStore, QuickCheckHistoryItem } from '../../store/useAppStore';
import { ConflictEngine } from '../../utils/conflictEngine';
import dayjs from 'dayjs';
import { Conflict } from '../../types';
import SystemSelector from '../common/SystemSelector';

interface QuickCheckWidgetProps {
  onConflictsDetected?: (conflicts: Conflict[]) => void;
  onClearConflicts?: () => void;
}

const { RangePicker } = DatePicker;

const QuickCheckWidget: React.FC<QuickCheckWidgetProps> = ({ onConflictsDetected, onClearConflicts }) => {
  const { systems, plans, quickCheckHistory, addQuickCheckHistory } = useAppStore();
  const [selectedSystemIds, setSelectedSystemIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[] | null>(null);

  const handleCheck = () => {
    if (!dateRange || selectedSystemIds.length === 0) return;

    const [start, end] = dateRange;
    const startDateStr = start.format('YYYY-MM-DD');
    const endDateStr = end.format('YYYY-MM-DD');

    // Add to history
    // Avoid adding duplicate if it matches the very last entry
    const lastHistory = quickCheckHistory[0];
    const isDuplicate = lastHistory && 
      lastHistory.startDate === startDateStr && 
      lastHistory.endDate === endDateStr &&
      lastHistory.systemIds.length === selectedSystemIds.length &&
      lastHistory.systemIds.every(id => selectedSystemIds.includes(id));

    if (!isDuplicate) {
      addQuickCheckHistory({
        startDate: startDateStr,
        endDate: endDateStr,
        systemIds: selectedSystemIds,
      });
    }

    const result = ConflictEngine.checkAvailability(
      selectedSystemIds,
      startDateStr,
      endDateStr,
      plans,
      systems
    );

    setConflicts(result);
    if (result && result.length > 0 && onConflictsDetected) {
        onConflictsDetected(result);
    } else if (result && result.length === 0 && onClearConflicts) {
        onClearConflicts();
    }
  };

  const handleRestore = (item: QuickCheckHistoryItem) => {
    setDateRange([dayjs(item.startDate), dayjs(item.endDate)]);
    setSelectedSystemIds(item.systemIds);
    setConflicts(null); // Clear previous results when restoring
    if (onClearConflicts) onClearConflicts();
  };

  const handleReset = () => {
    setSelectedSystemIds([]);
    setDateRange(null);
    setConflicts(null);
    if (onClearConflicts) onClearConflicts();
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">外灰/全网时间段</label>
            <RangePicker 
              className="w-full" 
              value={dateRange}
              onChange={(dates) => {
                  setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
                  setConflicts(null);
                  if (onClearConflicts) onClearConflicts();
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
                  if (onClearConflicts) onClearConflicts();
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

        {/* Recent History */}
        {quickCheckHistory.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 mr-1">
              <History size={12} />
              <span>最近查询:</span>
            </div>
            {quickCheckHistory.map(item => {
              const systemNames = systems
                .filter(s => item.systemIds.includes(s.id))
                .map(s => s.name)
                .join(', ');
                
              return (
                <Tooltip key={item.id} title={`涉及系统: ${systemNames}`} placement="top">
                  <Tag 
                    className="cursor-pointer hover:border-blue-400 m-0 flex items-center gap-1 transition-colors"
                    onClick={() => handleRestore(item)}
                  >
                    <Clock size={10} className="text-gray-400" />
                    <span>{dayjs(item.startDate).format('MM-DD')}~{dayjs(item.endDate).format('MM-DD')}</span>
                    <span className="text-gray-400">({item.systemIds.length}系统)</span>
                  </Tag>
                </Tooltip>
              );
            })}
          </div>
        )}
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
