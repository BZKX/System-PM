import React, { useState } from 'react';
import { Layout, Menu, theme, Button, Popconfirm, message, Upload, Modal } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  CalendarDays,
  Menu as MenuIcon,
  Settings,
  Download,
  Upload as UploadIcon,
  Trash2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { clearData, systems, plans, setInitialData } = useAppStore();

  const handleClearData = () => {
    clearData();
    message.success('数据已清空');
    window.location.reload();
  };

  const handleExport = () => {
    const data = {
        systems,
        plans,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-pm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('数据导出成功');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.systems && Array.isArray(json.systems) && json.plans && Array.isArray(json.plans)) {
            // Confirm overwrite
            Modal.confirm({
                title: '确认导入数据?',
                content: '导入将覆盖当前的全部数据，建议先导出备份。是否继续?',
                okText: '确认覆盖',
                cancelText: '取消',
                onOk: () => {
                    setInitialData(json.systems, json.plans);
                    message.success(`成功导入 ${json.systems.length} 个系统和 ${json.plans.length} 个计划`);
                    // 刷新页面以确保所有组件更新
                    setTimeout(() => window.location.reload(), 1000);
                }
            });
        } else {
            message.error('导入失败：文件格式不正确，缺少 systems 或 plans 字段');
        }
      } catch (err) {
        console.error(err);
        message.error('导入失败：JSON 解析错误');
      }
    };
    reader.readAsText(file);
    return false; // Prevent upload
  };

  const items = [
    {
      key: '/',
      icon: <LayoutDashboard size={18} />,
      label: '仪表盘',
    },
    {
      key: '/plans',
      icon: <CalendarDays size={18} />,
      label: '计划管理',
    },
    {
      key: '/systems',
      icon: <Server size={18} />,
      label: '系统管理',
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light" className="border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className={`font-bold text-xl text-blue-600 transition-all duration-300 ${collapsed ? 'scale-0 w-0' : 'scale-100'}`}>
            System PM
          </h1>
        </div>
        <div className="flex-1 overflow-auto">
            <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={items}
            onClick={({ key }) => navigate(key)}
            className="border-none mt-2"
            />
        </div>
        
        {/* 底部工具栏 */}
        <div className="p-2 border-t border-gray-200">
            <Button 
                type="text" 
                block 
                icon={<Settings size={18} />}
                className={collapsed ? 'px-0 justify-center' : 'justify-start'}
                onClick={() => setIsSettingsOpen(true)}
                title="数据管理"
            >
                {!collapsed && "数据管理"}
            </Button>
        </div>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} className="flex items-center px-4 border-b border-gray-200">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <MenuIcon size={20} />
          </button>
          <span className="ml-4 text-gray-500 text-sm">系统借用调度管理台</span>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* 数据管理弹窗 */}
      <Modal
        title="数据管理"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        footer={null}
        width={400}
      >
        <div className="flex flex-col gap-4 py-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-900 mb-2">数据备份与恢复</h3>
                <p className="text-xs text-blue-600 mb-4">导出当前所有数据为 JSON 文件，或从备份文件恢复数据。</p>
                <div className="flex gap-2">
                    <Button icon={<Download size={14} />} onClick={handleExport} className="flex-1">
                        导出备份
                    </Button>
                    <Upload 
                        beforeUpload={handleImport} 
                        showUploadList={false} 
                        accept=".json"
                        className="flex-1"
                    >
                        <Button icon={<UploadIcon size={14} />} className="w-full">
                            导入恢复
                        </Button>
                    </Upload>
                </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <h3 className="font-medium text-red-900 mb-2">危险区域</h3>
                <p className="text-xs text-red-600 mb-4">清空所有本地存储的数据，此操作不可撤销。</p>
                <Popconfirm
                    title="确定清空所有数据吗?"
                    description="此操作将删除所有计划和系统数据，且不可恢复。"
                    onConfirm={handleClearData}
                    okText="清空"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger block icon={<Trash2 size={14} />}>
                        清空所有数据
                    </Button>
                </Popconfirm>
            </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default MainLayout;
