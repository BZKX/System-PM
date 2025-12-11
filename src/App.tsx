import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import MainLayout from './components/MainLayout';
import { useAppStore } from './store/useAppStore';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Systems = lazy(() => import('./pages/Systems'));
const Plans = lazy(() => import('./pages/Plans'));

const App: React.FC = () => {
  const { theme: currentTheme } = useAppStore();

  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#2563eb', // blue-600
        },
      }}
    >
      <BrowserRouter>
        <Suspense 
          fallback={
            <div className="flex items-center justify-center h-screen w-screen bg-gray-50 dark:bg-gray-900">
              <Spin size="large" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="plans" element={<Plans />} />
              <Route path="systems" element={<Systems />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
