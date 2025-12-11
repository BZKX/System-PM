import React from 'react';
import { Select, message } from 'antd';
import { System } from '../../types';

interface SystemSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  systems: System[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const SystemSelector: React.FC<SystemSelectorProps> = ({ 
  value = [], 
  onChange, 
  systems, 
  placeholder = "选择或粘贴系统列表 (支持逗号、换行分隔)",
  className,
  disabled
}) => {
  
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // 阻止默认粘贴行为，避免只粘贴到输入框中
    e.preventDefault();
    
    const text = e.clipboardData.getData('text');
    if (!text) return;

    // 分割符：换行、回车、空格、逗号、分号、竖线
    // 正则解释：
    // \n, \r : 换行
    // \s : 空白字符 (包含空格, tab)
    // , : 逗号
    // ; : 分号
    // | : 竖线
    // 同时也支持中文逗号和分号
    const separators = /[\n\r\s,;|，；]+/;
    const rawTokens = text.split(separators).map(t => t.trim()).filter(Boolean);

    if (rawTokens.length === 0) return;

    // 建立名称到ID的映射，方便查找 (忽略大小写)
    const nameToIdMap = new Map<string, string>();
    systems.forEach(s => {
      nameToIdMap.set(s.name.toLowerCase(), s.id);
    });

    const matchedIds: string[] = [];
    const notFoundNames: string[] = [];

    rawTokens.forEach(token => {
      const lowerToken = token.toLowerCase();
      if (nameToIdMap.has(lowerToken)) {
        matchedIds.push(nameToIdMap.get(lowerToken)!);
      } else {
        notFoundNames.push(token);
      }
    });

    // 合并现有值，去重
    const newValue = Array.from(new Set([...value, ...matchedIds]));
    
    if (matchedIds.length > 0) {
      onChange?.(newValue);
      
      if (notFoundNames.length > 0) {
        message.warning(`已添加 ${matchedIds.length} 个系统，但有 ${notFoundNames.length} 个名称未匹配: ${notFoundNames.join(', ')}`);
      } else {
        message.success(`成功识别并添加 ${matchedIds.length} 个系统`);
      }
    } else {
      message.error(`未能识别任何匹配的系统。未匹配名称: ${notFoundNames.join(', ')}`);
    }
  };

  return (
    <div onPaste={handlePaste} className="w-full">
      <Select
        mode="multiple"
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        value={value}
        onChange={onChange}
        style={{ width: '100%' }}
        filterOption={(input, option) => {
          if (!option) return false;
          const sys = systems.find(s => s.id === option.value);
          if (!sys) return false;
          return (
              sys.name.toLowerCase().includes(input.toLowerCase()) || 
              sys.department.toLowerCase().includes(input.toLowerCase())
          );
        }}
        optionFilterProp="children"
      >
        {systems.map(sys => (
          <Select.Option key={sys.id} value={sys.id}>
            {sys.name} <span className="text-gray-400 text-xs ml-1">({sys.department})</span>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default SystemSelector;
