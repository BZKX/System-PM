import React, { useState, useRef, useEffect } from 'react';
import { Layout, Menu, theme, Button, Popconfirm, message, Upload, Modal, Tour, type TourProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Server, 
  CalendarDays,
  Menu as MenuIcon,
  Settings,
  Download,
  Upload as UploadIcon,
  Trash2,
  Moon,
  Sun,
  FileChartColumn,
  HelpCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme: currentTheme, toggleTheme, hasSeenGuide, completeGuide, resetGuide } = useAppStore();
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { clearData, systems, plans, setInitialData } = useAppStore();

  // Tour refs
  const sidebarNavRef = useRef(null);
  const themeToggleRef = useRef(null);
  const settingsBtnRef = useRef(null);
  const mainContentRef = useRef(null);
  const helpBtnRef = useRef(null);

  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (!hasSeenGuide) {
        // Small delay to ensure elements are rendered
        setTimeout(() => setIsTourOpen(true), 500);
    }
  }, [hasSeenGuide]);

  const handleTourClose = () => {
    setIsTourOpen(false);
    completeGuide();
  };

  const tourSteps: TourProps['steps'] = [
    {
      title: '欢迎使用 System PM',
      description: '这是一个用于系统借用和上线计划管理的工具。让我们花一分钟了解主要功能。',
      target: () => document.body, // Center screen
    },
    {
      title: '功能导航',
      description: '在这里切换不同的视图：仪表盘查看概览，计划管理查看甘特图，系统管理维护基础数据。',
      target: () => sidebarNavRef.current,
    },
    {
      title: '操作区域',
      description: '这里是主要的工作区域。在不同的页面，你可以查看图表、编辑计划或管理系统列表。',
      target: () => mainContentRef.current,
    },
    {
      title: '外观设置',
      description: '点击这里可以切换亮色/暗色模式，适应不同的光照环境。',
      target: () => themeToggleRef.current,
    },
    {
      title: '数据管理',
      description: '非常重要！这里可以导入/导出数据备份，或清空缓存。建议定期导出备份以防数据丢失。',
      target: () => settingsBtnRef.current,
    },
    {
        title: '随时回顾',
        description: '如果有疑问，可以随时点击这个按钮重新查看新手引导。',
        target: () => helpBtnRef.current,
    }
  ];

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

  const handleExportSystems = () => {
    const data = systems;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `systems-list-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('系统列表导出成功');
  };

  const handleImportSystems = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json) && json.every(item => item.id && item.name)) {
            Modal.confirm({
                title: '确认导入系统列表?',
                content: `即将导入 ${json.length} 个系统。这将覆盖现有的系统列表（计划数据将保留）。`,
                okText: '确认覆盖',
                cancelText: '取消',
                onOk: () => {
                    setInitialData(json, plans);
                    message.success(`成功导入 ${json.length} 个系统`);
                }
            });
        } else {
            message.error('导入失败：文件格式不正确，应为系统对象数组');
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
      icon: <FileChartColumn size={18} />,
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
    <Layout className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-950">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        className="border-r border-gray-200 dark:border-gray-800 !bg-white/70 dark:!bg-gray-900/70 backdrop-blur-2xl z-20"
        width={220}
      >
        <div className="flex flex-col h-full">
            <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
            <h1 className={`font-bold text-xl text-blue-600 dark:text-blue-500 transition-all duration-300 ${collapsed ? 'scale-0 w-0' : 'scale-100'}`}>
                System PM
            </h1>
            </div>
            <div className="flex-1 overflow-auto py-2" ref={sidebarNavRef}>
                <Menu
                    theme={currentTheme}
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={items}
                    onClick={({ key }) => navigate(key)}
                    className="border-none !bg-transparent"
                />
            </div>
            
            {/* 底部工具栏 */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-1">
                <div ref={themeToggleRef}>
                    <Button 
                        type="text" 
                        block 
                        icon={currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        className={collapsed ? 'px-0 justify-center' : 'justify-start'}
                        onClick={toggleTheme}
                        title={currentTheme === 'dark' ? "切换亮色模式" : "切换暗色模式"}
                    >
                        {!collapsed && (currentTheme === 'dark' ? "亮色模式" : "暗色模式")}
                    </Button>
                </div>
                <div ref={settingsBtnRef}>
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
                <div ref={helpBtnRef}>
                    <Button 
                        type="text" 
                        block 
                        icon={<HelpCircle size={18} />}
                        className={collapsed ? 'px-0 justify-center' : 'justify-start'}
                        onClick={() => {
                            resetGuide();
                            setIsTourOpen(true);
                        }}
                        title="新手引导"
                    >
                        {!collapsed && "新手引导"}
                    </Button>
                </div>
            </div>
        </div>
      </Sider>
      <Layout className="flex flex-col h-full overflow-hidden bg-transparent">
        <Header className="flex items-center px-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 !bg-white/60 dark:!bg-gray-900/60 backdrop-blur-xl z-10 sticky top-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-600 dark:text-gray-300"
          >
            <MenuIcon size={20} />
          </button>
          <span className="ml-4 text-gray-500 dark:text-gray-400 text-sm">系统借用调度管理台</span>
        </Header>
        <div className="flex-1 overflow-auto" ref={mainContentRef}>
            <Content
            style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: 280,
                background: currentTheme === 'dark' ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: borderRadiusLG,
                border: currentTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
            >
            <Outlet />
            </Content>
        </div>
        {/* 新手引导 */}
      <Tour open={isTourOpen} onClose={handleTourClose} steps={tourSteps} />
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
                
                {/* 全量数据 */}
                <div className="mb-4">
                    <p className="text-xs text-blue-600 mb-2 font-medium">全量数据 (系统 + 计划)</p>
                    <div className="flex gap-2">
                        <Button icon={<Download size={14} />} onClick={handleExport} className="flex-1">
                            导出全量备份
                        </Button>
                        <Upload 
                            beforeUpload={handleImport} 
                            showUploadList={false} 
                            accept=".json"
                            className="flex-1"
                        >
                            <Button icon={<UploadIcon size={14} />} className="w-full">
                                导入全量恢复
                            </Button>
                        </Upload>
                    </div>
                </div>

                {/* 分割线 */}
                <div className="h-px bg-blue-200 my-3"></div>

                {/* 系统列表 */}
                <div>
                    <p className="text-xs text-blue-600 mb-2 font-medium">仅系统列表</p>
                    <div className="flex gap-2">
                        <Button icon={<Download size={14} />} onClick={handleExportSystems} className="flex-1">
                            导出系统列表
                        </Button>
                        <Upload 
                            beforeUpload={handleImportSystems} 
                            showUploadList={false} 
                            accept=".json"
                            className="flex-1"
                        >
                            <Button icon={<UploadIcon size={14} />} className="w-full">
                                导入系统列表
                            </Button>
                        </Upload>
                    </div>
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
