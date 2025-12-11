import React from 'react';
import { Card, Button, Popconfirm } from 'antd';
import { Edit, Trash2, Box } from 'lucide-react';
import { System } from '../../types';

interface SystemCardProps {
  system: System;
  onEdit: (system: System) => void;
  onDelete: (id: string) => void;
}

const SystemCard: React.FC<SystemCardProps> = ({ system, onEdit, onDelete }) => {
  return (
    <Card 
      className="hover:shadow-md transition-shadow"
      actions={[
        <Button 
          type="text" 
          icon={<Edit size={16} />} 
          onClick={() => onEdit(system)}
          key="edit"
        >
          编辑
        </Button>,
        <Popconfirm
          title="确定删除吗?"
          description="删除系统可能会影响已关联的计划。"
          onConfirm={() => onDelete(system.id)}
          okText="是"
          cancelText="否"
          key="delete"
        >
          <Button type="text" danger icon={<Trash2 size={16} />} >
            删除
          </Button>
        </Popconfirm>
      ]}
    >
      <Card.Meta
        avatar={
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            <Box size={24} />
          </div>
        }
        title={
          <div className="flex justify-between items-center">
            <span className="truncate" title={system.name}>{system.name}</span>
          </div>
        }
        description={
          <div className="mt-2 space-y-2">
            <div>
                <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold mb-1">归属部门</div>
                <div className="text-gray-700 dark:text-gray-300 font-medium truncate" title={system.department}>{system.department}</div>
            </div>
            {system.owner && (
                <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold mb-1">负责人</div>
                    <div className="text-gray-700 dark:text-gray-300 font-medium truncate" title={system.owner}>{system.owner}</div>
                </div>
            )}
          </div>
        }
      />
    </Card>
  );
};

export default SystemCard;
