import React, { useState, useMemo } from 'react';
import { Button, Modal, Form, Input, Empty, Pagination, Upload, message } from 'antd';
import { Plus, Upload as UploadIcon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { System } from '../types';
import { v4 as uuidv4 } from 'uuid';
import SystemCard from '../components/systems/SystemCard';

const PAGE_SIZE = 12;

const Systems: React.FC = () => {
  const { systems, addSystem, updateSystem, deleteSystem } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  
  // Filter & Pagination State
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: System) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        updateSystem({ ...values, id: editingId });
      } else {
        // Explicitly ignore type or set a default
        addSystem({ ...values, id: uuidv4(), type: 'backend' });
      }
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  // Import Logic
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
            let count = 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            json.forEach((item: any) => {
                const newSystem: System = {
                    id: uuidv4(),
                    name: item.sys_en_name || item.sys_zh_name || 'Unknown',
                    department: item.department_name || 'Unknown',
                    type: 'backend', // Default generic type
                    owner: item.leader || item.creator || '',
                };
                
                // 避免重复导入 (按名称)
                if (!systems.some(s => s.name === newSystem.name)) {
                    addSystem(newSystem);
                    count++;
                }
            });
            message.success(`成功导入 ${count} 个新系统`);
        } else {
            message.error('导入失败：文件格式不正确，应为 JSON 数组');
        }
      } catch (err) {
        console.error(err);
        message.error('导入失败：JSON 解析错误');
      }
    };
    reader.readAsText(file);
    return false; // Prevent upload
  };

  // Filter Logic
  const filteredSystems = useMemo(() => {
    return systems.filter(sys => {
      const matchSearch = sys.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          sys.department.toLowerCase().includes(searchText.toLowerCase());
      return matchSearch;
    });
  }, [systems, searchText]);

  // Pagination Logic
  const paginatedSystems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSystems.slice(start, start + PAGE_SIZE);
  }, [filteredSystems, currentPage]);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">系统管理</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">管理所有前后端系统资源及其归属部门</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Input.Search 
                placeholder="搜索系统名称或部门" 
                allowClear 
                onSearch={val => setSearchText(val)}
                onChange={e => setSearchText(e.target.value)}
                className="w-full sm:w-64"
            />
            <Upload 
                beforeUpload={handleImport} 
                showUploadList={false} 
                accept=".json"
            >
                <Button icon={<UploadIcon size={16} />}>导入 JSON</Button>
            </Upload>
            <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            新增系统
            </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <span className="text-xs text-gray-400 ml-auto">
            共 {filteredSystems.length} 个系统
        </span>
      </div>

      {paginatedSystems.length > 0 ? (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {paginatedSystems.map(system => (
                <SystemCard
                key={system.id}
                system={system}
                onEdit={handleEdit}
                onDelete={deleteSystem}
                />
            ))}
            </div>
            <div className="flex justify-center">
                <Pagination
                    current={currentPage}
                    total={filteredSystems.length}
                    pageSize={PAGE_SIZE}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                />
            </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex justify-center">
            <Empty description="暂无匹配的系统数据" />
        </div>
      )}

      <Modal
        title={editingId ? "编辑系统" : "新增系统"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="系统名称"
            rules={[{ required: true, message: '请输入系统名称' }]}
          >
            <Input placeholder="例如：交易中心前端" />
          </Form.Item>
          <Form.Item
            name="department"
            label="归属部门"
            rules={[{ required: true, message: '请输入归属部门' }]}
          >
            <Input placeholder="例如：交易技术部" />
          </Form.Item>
          <Form.Item
            name="owner"
            label="负责人"
          >
            <Input placeholder="例如：ZhangSan" />
          </Form.Item>
          {/* Hidden Type Field with default value */}
          <Form.Item
            name="type"
            hidden
            initialValue="backend"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Systems;
